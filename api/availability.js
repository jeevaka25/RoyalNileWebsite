const FETCH_TIMEOUT_MS = 6000;
const MAX_CALENDARS = 8;

function parseDateParam(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseICalDate(value) {
  const match = String(value || '').match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  return new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
}

function unfoldICal(text) {
  return text.replace(/\r?\n[ \t]/g, '');
}

function getBookedDatesFromICal(text) {
  const booked = new Set();
  const events = unfoldICal(text).match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
  for (const event of events) {
    const startMatch = event.match(/^DTSTART[^:]*:(.+)$/m);
    const endMatch = event.match(/^DTEND[^:]*:(.+)$/m);
    const start = parseICalDate(startMatch && startMatch[1].trim());
    const end = parseICalDate(endMatch && endMatch[1].trim());
    if (!start || !end || end <= start) continue;
    for (const date = new Date(start); date < end; date.setUTCDate(date.getUTCDate() + 1)) {
      booked.add(formatDate(date));
    }
  }
  return booked;
}

function isAvailable(bookedDates, checkin, checkout) {
  for (const date = new Date(checkin); date < checkout; date.setUTCDate(date.getUTCDate() + 1)) {
    if (bookedDates.has(formatDate(date))) return false;
  }
  return true;
}

function isAllowedAirbnbCalendarUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'www.airbnb.co.uk' &&
      /^\/calendar\/ical\/\d+\.ics$/.test(url.pathname) &&
      url.searchParams.has('t')
    );
  } catch (error) {
    return false;
  }
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

async function fetchCalendar(icalUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(icalUrl, {
      signal: controller.signal,
      headers: { 'user-agent': 'RoyalNileWebsite/1.0' },
    });
    if (!response.ok) throw new Error(`Airbnb calendar returned ${response.status}`);
    return getBookedDatesFromICal(await response.text());
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method not allowed');
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid JSON body.' }));
    return;
  }

  const checkin = parseDateParam(payload.checkin);
  const checkout = parseDateParam(payload.checkout);
  const calendars = Array.isArray(payload.calendars) ? payload.calendars.slice(0, MAX_CALENDARS) : [];

  if (!checkin || !checkout || checkout <= checkin || !calendars.length) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Valid checkin, checkout, and calendars are required.' }));
    return;
  }

  const sanitizedCalendars = calendars
    .filter(calendar => calendar && typeof calendar.id === 'string' && isAllowedAirbnbCalendarUrl(calendar.icalUrl))
    .map(calendar => ({ id: calendar.id, roomId: String(calendar.roomId || ''), icalUrl: calendar.icalUrl }));

  const results = await Promise.all(sanitizedCalendars.map(async calendar => {
    try {
      const bookedDates = await fetchCalendar(calendar.icalUrl);
      return {
        id: calendar.id,
        roomId: calendar.roomId,
        available: isAvailable(bookedDates, checkin, checkout),
        bookedDateCount: bookedDates.size,
        source: 'airbnb-ical',
      };
    } catch (error) {
      return {
        id: calendar.id,
        roomId: calendar.roomId,
        available: null,
        source: 'unverified',
        error: error.name === 'AbortError' ? 'Calendar request timed out.' : 'Calendar could not be checked.',
      };
    }
  }));

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    checkin: formatDate(checkin),
    checkout: formatDate(checkout),
    checkedAt: new Date().toISOString(),
    results,
  }));
};
