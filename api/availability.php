<?php
declare(strict_types=1);

const FETCH_TIMEOUT_SECONDS = 5;
const MAX_CALENDARS = 8;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=300');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function parseDateParam(mixed $value): ?DateTimeImmutable {
    if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) return null;
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value, new DateTimeZone('UTC'));
    return $date && $date->format('Y-m-d') === $value ? $date : null;
}

function isAllowedAirbnbUrl(mixed $value): bool {
    if (!is_string($value) || !filter_var($value, FILTER_VALIDATE_URL)) return false;
    $url = parse_url($value);
    return ($url['scheme'] ?? '') === 'https'
        && ($url['host'] ?? '') === 'www.airbnb.co.uk'
        && preg_match('#^/calendar/ical/\d+\.ics$#', $url['path'] ?? '')
        && str_contains($url['query'] ?? '', 't=');
}

function parseICalDate(string $value): ?DateTimeImmutable {
    if (!preg_match('/^(\d{4})(\d{2})(\d{2})/', $value, $match)) return null;
    return DateTimeImmutable::createFromFormat('!Ymd', $match[1].$match[2].$match[3], new DateTimeZone('UTC')) ?: null;
}

function bookedDatesFromICal(string $text): array {
    $text = preg_replace("/\r?\n[ \t]/", '', $text);
    preg_match_all('/BEGIN:VEVENT(.*?)END:VEVENT/s', $text, $events);
    $booked = [];
    foreach ($events[1] ?? [] as $event) {
        preg_match('/^DTSTART[^:]*:(.+)$/m', $event, $startMatch);
        preg_match('/^DTEND[^:]*:(.+)$/m', $event, $endMatch);
        $start = parseICalDate(trim($startMatch[1] ?? ''));
        $end = parseICalDate(trim($endMatch[1] ?? ''));
        if (!$start || !$end || $end <= $start) continue;
        for ($date = $start; $date < $end; $date = $date->modify('+1 day')) {
            $booked[$date->format('Y-m-d')] = true;
        }
    }
    return $booked;
}

function fetchCalendar(string $url): array {
    if (!function_exists('curl_init')) {
        throw new RuntimeException('The cURL PHP extension is unavailable.');
    }
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => FETCH_TIMEOUT_SECONDS,
        CURLOPT_TIMEOUT => FETCH_TIMEOUT_SECONDS,
        CURLOPT_USERAGENT => 'RoyalNileWebsite/1.0',
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    if (!is_string($body) || $status < 200 || $status >= 300) {
        throw new RuntimeException($error ?: "Calendar returned HTTP $status");
    }
    return bookedDatesFromICal($body);
}

function isAvailable(array $booked, DateTimeImmutable $checkin, DateTimeImmutable $checkout): bool {
    for ($date = $checkin; $date < $checkout; $date = $date->modify('+1 day')) {
        if (isset($booked[$date->format('Y-m-d')])) return false;
    }
    return true;
}

$payload = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($payload)) respond(400, ['error' => 'Invalid JSON body.']);

$checkin = parseDateParam($payload['checkin'] ?? null);
$checkout = parseDateParam($payload['checkout'] ?? null);
$calendars = array_slice(is_array($payload['calendars'] ?? null) ? $payload['calendars'] : [], 0, MAX_CALENDARS);

if (!$checkin || !$checkout || $checkout <= $checkin || !$calendars) {
    respond(400, ['error' => 'Valid checkin, checkout, and calendars are required.']);
}

$results = [];
foreach ($calendars as $calendar) {
    if (!is_array($calendar) || !is_string($calendar['id'] ?? null) || !isAllowedAirbnbUrl($calendar['icalUrl'] ?? null)) {
        continue;
    }
    try {
        $booked = fetchCalendar($calendar['icalUrl']);
        $results[] = [
            'id' => $calendar['id'],
            'roomId' => (string) ($calendar['roomId'] ?? ''),
            'available' => isAvailable($booked, $checkin, $checkout),
            'bookedDateCount' => count($booked),
            'source' => 'airbnb-ical',
            'failedSources' => [],
        ];
    } catch (Throwable $error) {
        $results[] = [
            'id' => $calendar['id'],
            'roomId' => (string) ($calendar['roomId'] ?? ''),
            'available' => null,
            'source' => 'unverified',
            'failedSources' => ['airbnb-ical'],
            'error' => 'Calendar could not be checked.',
        ];
    }
}

respond(200, [
    'checkin' => $checkin->format('Y-m-d'),
    'checkout' => $checkout->format('Y-m-d'),
    'checkedAt' => gmdate(DATE_ATOM),
    'results' => $results,
]);
