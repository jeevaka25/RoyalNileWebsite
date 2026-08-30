const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { VILLAS, TOURS } = require('./data');
const { ARTICLES } = require('./travel-guide-data');
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const home = read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
for (const villa of VILLAS) assert.ok(home.includes(`href="/villas/${villa.id}"`), 'Unlinked villa: ' + villa.id);
for (const tour of TOURS) assert.ok(home.includes(`href="/${tour.primarySlug}"`), 'Unlinked tour: ' + tour.id);
const files = ['index.html', 'restaurant.html', ...TOURS.map((tour) => tour.primarySlug + '.html'), ...VILLAS.map((villa) => 'villas/' + villa.id + '.html'), 'egypt-travel-guide/index.html', ...ARTICLES.map((article) => 'egypt-travel-guide/' + article.slug + '/index.html')];
const walk = (value) => {
  if (!value || typeof value !== 'object') return;
  if (value['@type'] === 'TouristTrip') assert.ok(!value.additionalProperty);
  Object.values(value).forEach(walk);
};
for (const file of files) {
  const html = read(file);
  assert.ok(html.includes('src="/analytics-events.js"'), 'Tracking missing: ' + file);
  for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) walk(JSON.parse(match[1]));
}
const listeners = {}, events = [];
vm.runInNewContext(read('analytics-events.js'), {
  URL, location: { href: 'https://egyptvillastours.com/test?private=hidden', pathname: '/test' },
  document: { addEventListener: (name, handler) => { listeners[name] = handler; } },
  gtag: (...args) => events.push(args), fbq: () => {},
});
const click = (href, form) => listeners.click({ target: { closest: () => ({ href, hasAttribute: () => form }) } });
click('https://wa.me/201204421652?text=PRIVATE_MESSAGE', true);
assert.equal(events[0][1], 'enquiry_start');
listeners['royal-inquiry-outbound']();
assert.equal(events[1][1], 'whatsapp_click');
click('https://www.airbnb.com/rooms/123?private=hidden', false);
assert.equal(events[2][1], 'airbnb_click');
assert.ok(!JSON.stringify(events).includes('PRIVATE_MESSAGE'));
assert.ok(!JSON.stringify(events).includes('private='));
console.log(`Verified ${files.length} pages, all villa/tour homepage links, supported trip markup and privacy-safe enquiry events.`);
