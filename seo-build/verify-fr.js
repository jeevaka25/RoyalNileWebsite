// Checks the French pages (/fr/, /fr/villas/, /fr/villas/<id>) against their English originals.
// Run after node seo-build/fr/build-fr.js.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { PAGES, buildPage } = require('./fr/build-fr');
const { tokenize, walk, getAttr, decode } = require('./fr/html');
const catalog = require('./fr/catalog');
const { SITE } = require('./data');
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const ORIGIN = 'https://egyptvillastours.com';
const TRANSLATED = new Set(PAGES.map((p) => p.enPath));

// Visible text, attribute text and links of a page, scripts excluded.
function parts(html) {
  const text = [], attrs = [], links = [];
  walk(tokenize(html), (t, stack) => {
    const inside = (sel) => stack.some((s) => (sel.startsWith('.') ? s.cls.split(/\s+/).includes(sel.slice(1)) : s.name === sel));
    if (t.type === 'text' && !inside('script') && !inside('style')) {
      const s = decode(t.raw).replace(/[ \t\r\n]+/g, ' ').trim();
      if (s && !catalog.KEEP_CONTEXT.some((sel) => sel.every(inside))) text.push(s);
    }
    if (t.type === 'open') {
      for (const a of ['alt', 'aria-label', 'title']) { const v = getAttr(t.raw, a); if (v && t.name !== 'link') attrs.push(decode(v)); }
      if (t.name === 'a') links.push({ href: decode(getAttr(t.raw, 'href') || ''), tag: t.raw });
    }
  });
  return { text, attrs, links };
}
// Facts compared between languages: every number on the page, French style normalised.
const numbers = (strings) => strings.join(' ').replace(/(\d)[  ](\d{3})/g, '$1$2').replace(/(\d),(\d{3})\b/g, '$1$2').replace(/(\d),(\d)/g, '$1.$2').match(/\d+(?:\.\d+)?/g) || [];
const count = (list) => list.reduce((m, n) => m.set(n, (m.get(n) || 0) + 1), new Map());
// Known, intended number differences between the English and French wording.
const ALLOWED_EXTRA_FR = { '600': 'balloon height given in metres as well as feet' };
const ALLOWED_FLOOR = /^(2|1)$/; // US "2nd Floor" is French "1er étage"

const SAME_IN_BOTH = new Set([...catalog.KEEP, ...Object.entries(catalog.TEXT).filter(([en, fr]) => en === fr).map(([en]) => en), 'Superhost Airbnb', 'Airbnb']);

let checked = 0;
for (const page of PAGES) {
  const fr = read(page.fr), en = read(page.en);
  // 1. Up to date: the committed French page is exactly what the builder makes from today's English page.
  assert.equal(fr, buildPage(page), `${page.fr} is out of date: run node seo-build/fr/build-fr.js`);
  // 2. Language, canonical, hreflang (both directions), locale.
  assert.match(fr, /<html[^>]*lang="fr"/, page.fr);
  assert.ok(fr.includes(`href="${ORIGIN}${page.frPath}" rel="canonical"`) || fr.includes(`rel="canonical" href="${ORIGIN}${page.frPath}"`), page.fr + ' canonical');
  for (const html of [fr, en]) {
    assert.ok(html.includes(`<link rel="alternate" hreflang="fr" href="${ORIGIN}${page.frPath}"/>`), 'hreflang fr on ' + page.en);
    assert.ok(html.includes(`<link rel="alternate" hreflang="en" href="${ORIGIN}${page.enPath}"/>`), 'hreflang en on ' + page.en);
    assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${ORIGIN}${page.enPath}"/>`), 'hreflang x-default on ' + page.en);
  }
  assert.ok(fr.includes(`content="${ORIGIN}${page.frPath}" property="og:url"`) || fr.includes(`property="og:url" content="${ORIGIN}${page.frPath}"`), page.fr + ' og:url');
  assert.ok(/content="fr_FR"/.test(fr), page.fr + ' og:locale');
  assert.ok(!/name="robots"[^>]*noindex|noindex[^>]*name="robots"/.test(fr), page.fr + ' must be indexable');
  assert.ok(read('sitemap.xml').includes(`<loc>${ORIGIN}${page.frPath}</loc>`), page.fr + ' missing from sitemap');
  // 3. Same tracking as the English page.
  assert.equal((fr.match(new RegExp(`fbq\\('init','${SITE.metaPixel}'\\)`, 'g')) || []).length, 1, page.fr + ' pixel');
  assert.ok(fr.includes('src="/analytics-events.js?v=20261004-context"'), page.fr + ' analytics');

  const F = parts(fr), E = parts(en);
  // 4. No English left: no French-page text that also appears as English text on the original,
  //    apart from names and words that are the same in both languages.
  const english = new Set([...E.text, ...E.attrs]);
  const leftovers = [...F.text, ...F.attrs].filter((s) => english.has(s) && /[A-Za-z]{3}/.test(s) && !SAME_IN_BOTH.has(s.replace(/^› /, '')));
  assert.deepEqual([...new Set(leftovers)], [], page.fr + ' has untranslated English');
  // 5. Facts: the numbers on the page match the English page.
  // Whole-hour French clock times use the 24-hour clock ("22 h" for "10pm"): compare them as 12-hour
  // values. Times with minutes ("13 h 05" for "13:05") are left as they are.
  const clock12 = (s) => s.replace(/\b(1[3-9]|2[0-3])(?=[\s\u00a0\u202f]h\b(?![\s\u00a0\u202f]*\d))/g, (h) => String(h - 12));
  const a = count(numbers([...E.text])), b = count(numbers([...F.text].map(clock12)));
  for (const n of new Set([...a.keys(), ...b.keys()])) {
    if ((a.get(n) || 0) === (b.get(n) || 0) || ALLOWED_EXTRA_FR[n] || ALLOWED_FLOOR.test(n)) continue;
    assert.fail(`${page.fr}: the number ${n} appears ${a.get(n) || 0}× in English but ${b.get(n) || 0}× in French`);
  }
  // 6. Links: translated pages link to French pages; booking links unchanged; WhatsApp in French.
  for (const { href, tag } of F.links) {
    const p = href.split('#')[0].split('?')[0];
    if (TRANSLATED.has(p)) assert.ok(/hreflang="en"/.test(tag), `${page.fr} links to English ${href} (only the EN switch may)`);
    if (/^https:\/\/wa\.me\//.test(href)) {
      const text = decodeURIComponent(href.split('?text=')[1] || '');
      assert.match(text, /^Bonjour/, `${page.fr} WhatsApp message not in French: ${href}`);
      assert.ok(!/\b(I'd|Hi!|Please|available\?)/.test(text), `${page.fr} WhatsApp message has English: ${text}`);
    }
  }
  const bookingLinks = (links) => links.map((l) => l.href).filter((h) => /airbnb\.|booking\.com/.test(h)).sort();
  assert.deepEqual(bookingLinks(F.links), bookingLinks(E.links), page.fr + ' booking links differ from English');
  assert.equal(F.links.filter((l) => /^https:\/\/wa\.me\//.test(l.href)).length, E.links.filter((l) => /^https:\/\/wa\.me\//.test(l.href)).length, page.fr + ' WhatsApp button count');
  checked++;
}

// 7. Cards the French homepage draws in the browser (shuffle and date search) are French too,
//    and every booking/WhatsApp link on them sends the same Meta Lead as the English site.
const home = read('fr/index.html');
const grid = { innerHTML: '' }, toursGrid = { innerHTML: '' };
const ctx = { document: { getElementById: (id) => (id === 'toursGrid' ? toursGrid : grid) }, vPhoto: () => '/x.webp', requestAnimationFrame: () => {}, Set, encodeURIComponent, URL };
const start = home.indexOf('const FR_TEXT=');
const code = home.slice(start, home.indexOf('\n', start)) + '\n' + read('villa-data.js') + '\n'
  + home.slice(home.indexOf('const SITE_VILLA_PHOTOS ='), home.indexOf('// ============================================\n// TOUR DATA')) + '\n'
  + home.slice(home.indexOf('const TOURS = ['), home.indexOf('function tourIdFromPath')) + '\n'
  + "const FEATURED_VILLA_IDS=new Set(['nile-view-2','nile-view-luxury-1']);\n"
  + home.slice(home.indexOf('function renderVillas('), home.indexOf('// ============================================\n// VILLA MODAL')) + '\n'
  + home.slice(home.indexOf('const TOUR_PAGE='), home.indexOf('// ============================================\n// INIT')) + '\n'
  + "renderVillas(VILLAS.map((v,i)=>({...v,available:i%2===0})),'2026-12-10','2026-12-14');renderTours();";
vm.runInNewContext(code, ctx);
const drawn = grid.innerHTML + toursGrid.innerHTML;
for (const word of ['bedrooms', 'guests', 'Airbnb reviews', 'Explore', 'Book on', 'Enquire', 'Save 10%', 'Available', 'Booked', 'Ground Floor', 'Top Floor', 'Queen Beds', 'Singles', 'Hi!']) {
  assert.ok(!drawn.includes(word), 'French homepage cards still show English: ' + word);
}
assert.ok(!/href="\/villas\//.test(drawn) && drawn.includes('href="/fr/villas/'), 'browser-drawn apartment cards must link to French pages');
assert.ok(drawn.includes(encodeURIComponent('du 10/12/2026 au 14/12/2026')), 'search dates in French format');
const listeners = {}, pixel = [];
vm.runInNewContext(read('analytics-events.js'), { URL, location: { pathname: '/fr/', href: ORIGIN + '/fr/' }, document: { addEventListener: (n, fn) => { listeners[n] = fn; } }, gtag: () => {}, fbq: (...args) => pixel.push(args) });
let leads = 0;
for (const m of drawn.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
  const href = m[1].replace(/&amp;/g, '&');
  if (!/wa\.me|airbnb\.|booking\.com/.test(href)) continue;
  const before = pixel.length;
  listeners.click({ target: { closest: () => ({ href, hasAttribute: () => false, getAttribute: () => null }) } });
  assert.equal(pixel[before + 1]?.[1], 'Lead', 'No Lead for ' + href);
  leads++;
}
console.log(`French pages passed: ${checked} pages up to date, lang/canonical/hreflang/sitemap correct, same pixel and analytics, no English left, numbers match the English pages, internal links stay in French, WhatsApp messages in French; ${leads} booking and WhatsApp links on browser-drawn cards send a Meta Lead.`);
