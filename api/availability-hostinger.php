<?php
declare(strict_types=1);

const FETCH_TIMEOUT_SECONDS = 5;
const MAX_CALENDARS = 8;
const CALENDAR_CACHE_SECONDS = 300;
const BOOKING_CALENDAR_CONFIG = '../../booking-calendars.php';

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

function isAllowedBookingUrl(mixed $value): bool {
    if (!is_string($value) || !filter_var($value, FILTER_VALIDATE_URL)) return false;
    $url = parse_url($value);
    $host = $url['host'] ?? '';
    $path = $url['path'] ?? '';
    return ($url['scheme'] ?? '') === 'https'
        && (
            ($host === 'ical.booking.com' && $path === '/v1/export')
            || ($host === 'admin.booking.com' && $path === '/hotel/hoteladmin/ical.html')
        )
        && str_contains($url['query'] ?? '', 't=');
}

function loadBookingCalendars(): array {
    $path = __DIR__ . '/' . BOOKING_CALENDAR_CONFIG;
    if (!is_file($path)) return [];
    try {
        $calendars = require $path;
    } catch (Throwable $error) {
        return [];
    }
    if (!is_array($calendars)) return [];
    return array_filter(
        $calendars,
        fn(mixed $url): bool => isAllowedBookingUrl($url),
    );
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

function calendarCachePath(string $url): string {
    return sys_get_temp_dir() . '/royal-nile-calendar-' . hash('sha256', $url) . '.json';
}

function readCalendarCache(string $url): ?array {
    $path = calendarCachePath($url);
    if (!is_file($path) || time() - (int) filemtime($path) > CALENDAR_CACHE_SECONDS) return null;
    $cached = json_decode(file_get_contents($path) ?: '', true);
    return is_array($cached) ? $cached : null;
}

function writeCalendarCache(string $url, array $booked): void {
    @file_put_contents(calendarCachePath($url), json_encode($booked), LOCK_EX);
}

function fetchCalendars(array $sources): array {
    $results = [];
    $pending = [];

    foreach ($sources as $key => $source) {
        $cached = readCalendarCache($source['url']);
        if ($cached !== null) {
            $results[$key] = ['ok' => true, 'booked' => $cached, 'cached' => true];
        } else {
            $pending[$key] = $source;
        }
    }

    if (!$pending) return $results;
    if (!function_exists('curl_multi_init')) {
        foreach ($pending as $key => $source) {
            $results[$key] = ['ok' => false, 'booked' => [], 'cached' => false];
        }
        return $results;
    }

    $multi = curl_multi_init();
    $handles = [];
    foreach ($pending as $key => $source) {
        $handle = curl_init($source['url']);
        curl_setopt_array($handle, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => FETCH_TIMEOUT_SECONDS,
            CURLOPT_TIMEOUT => FETCH_TIMEOUT_SECONDS,
            CURLOPT_USERAGENT => 'RoyalNileWebsite/1.0',
        ]);
        curl_multi_add_handle($multi, $handle);
        $handles[$key] = $handle;
    }

    do {
        $status = curl_multi_exec($multi, $active);
        if ($active) {
            $selected = curl_multi_select($multi, 1.0);
            if ($selected === -1) usleep(10000);
        }
    } while ($active && $status === CURLM_OK);

    foreach ($handles as $key => $handle) {
        $body = curl_multi_getcontent($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        $ok = is_string($body) && $status >= 200 && $status < 300 && curl_errno($handle) === 0;
        if ($ok) {
            $booked = bookedDatesFromICal($body);
            writeCalendarCache($pending[$key]['url'], $booked);
            $results[$key] = ['ok' => true, 'booked' => $booked, 'cached' => false];
        } else {
            $results[$key] = ['ok' => false, 'booked' => [], 'cached' => false];
        }
        curl_multi_remove_handle($multi, $handle);
        curl_close($handle);
    }
    curl_multi_close($multi);

    return $results;
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
$bookingCalendars = loadBookingCalendars();

if (!$checkin || !$checkout || $checkout <= $checkin || !$calendars) {
    respond(400, ['error' => 'Valid checkin, checkout, and calendars are required.']);
}

$properties = [];
$sourcesToFetch = [];
foreach ($calendars as $calendar) {
    if (!is_array($calendar) || !is_string($calendar['id'] ?? null) || !isAllowedAirbnbUrl($calendar['icalUrl'] ?? null)) {
        continue;
    }
    $sources = [
        ['name' => 'airbnb-ical', 'url' => $calendar['icalUrl']],
    ];
    if (isset($bookingCalendars[$calendar['id']])) {
        $sources[] = ['name' => 'booking-ical', 'url' => $bookingCalendars[$calendar['id']]];
    }

    $properties[] = [
        'id' => $calendar['id'],
        'roomId' => (string) ($calendar['roomId'] ?? ''),
        'sources' => $sources,
    ];
    foreach ($sources as $source) {
        $sourcesToFetch[$calendar['id'] . ':' . $source['name']] = $source;
    }
}

$fetchedCalendars = fetchCalendars($sourcesToFetch);
$results = [];
foreach ($properties as $property) {
    $booked = [];
    $successfulSources = [];
    $failedSources = [];
    $cachedSources = [];
    foreach ($property['sources'] as $source) {
        $fetched = $fetchedCalendars[$property['id'] . ':' . $source['name']] ?? ['ok' => false, 'booked' => [], 'cached' => false];
        if ($fetched['ok']) {
            $booked += $fetched['booked'];
            $successfulSources[] = $source['name'];
            if ($fetched['cached']) $cachedSources[] = $source['name'];
        } else {
            $failedSources[] = $source['name'];
        }
    }

    if ($successfulSources) {
        $available = isAvailable($booked, $checkin, $checkout);
        $results[] = [
            'id' => $property['id'],
            'roomId' => $property['roomId'],
            'available' => $available === false ? false : ($failedSources ? null : true),
            'bookedDateCount' => count($booked),
            'source' => implode('+', $successfulSources),
            'failedSources' => $failedSources,
            'cachedSources' => $cachedSources,
        ];
    } else {
        $results[] = [
            'id' => $property['id'],
            'roomId' => $property['roomId'],
            'available' => null,
            'source' => 'unverified',
            'failedSources' => $failedSources,
            'error' => 'Calendars could not be checked.',
        ];
    }
}

respond(200, [
    'checkin' => $checkin->format('Y-m-d'),
    'checkout' => $checkout->format('Y-m-d'),
    'checkedAt' => gmdate(DATE_ATOM),
    'results' => $results,
]);
