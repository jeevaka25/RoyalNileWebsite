/* eslint-disable */
// Builds the French pages (/fr/, /fr/villas/ and the eight /fr/villas/<id> pages) from the
// published English pages, which stay the master copy. Run after any change to those pages:
//
//   node seo-build/fr/build-fr.js
//
// Every English wording has its French wording beside it in seo-build/fr/catalog.js. Numbers
// (ratings, review counts, beds, minutes, years) are read from the English page at build time,
// so a fact update needs one edit to the English page and a rebuild. If an English sentence is
// reworded, the build stops and lists it so the French cannot silently go stale.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { tokenize, walk, getAttr, setAttr, decode, encodeText, encodeAttr } = require('./html');
const catalog = require('./catalog');

const ROOT = path.join(__dirname, '..', '..');
const ORIGIN = 'https://egyptvillastours.com';
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ---------- the translated pages ----------
const idsIn = (dir) => fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.html') && f !== 'index.html').map((f) => f.replace(/\.html$/, '')).sort();
const section = (dir) => [
  { en: `${dir}/index.html`, fr: `fr/${dir}/index.html`, enPath: `/${dir}/`, frPath: `/fr/${dir}/` },
  ...idsIn(dir).map((id) => ({ en: `${dir}/${id}.html`, fr: `fr/${dir}/${id}.html`, enPath: `/${dir}/${id}`, frPath: `/fr/${dir}/${id}` })),
];
const PAGES = [
  { en: 'index.html', fr: 'fr/index.html', enPath: '/', frPath: '/fr/' },
  ...section('villas'),
  ...section('tours'),
  { en: 'restaurant.html', fr: 'fr/restaurant.html', enPath: '/restaurant.html', frPath: '/fr/restaurant.html' },
];
const TRANSLATED = new Map(PAGES.map((p) => [p.enPath, p.frPath]));

// ---------- text translation ----------
const NUM = /\d[\d,]*(?:\.\d+)?/g;
const NNBSP = ' ', NBSP = ' ';
const fmtNum = (n) => (/^\d{1,3}(,\d{3})+$/.test(n) ? n.replace(/,/g, NNBSP) : n.replace('.', ','));
const norm = (s) => s.replace(/\s+/g, ' ').trim();
// French spacing: thin no-break space before ; ! ? and no-break space before : % and inside « ».
const typo = (s) => s.replace(/ ([;!?])/g, NNBSP + '$1').replace(/ :(?=\s|$)/g, NBSP + ':').replace(/(\d) %/g, '$1' + NBSP + '%').replace(/« /g, '«' + NBSP).replace(/ »/g, NBSP + '»');

const EXACT = new Map(), GENERAL = new Map();
for (const [en, fr] of Object.entries(catalog.TEXT)) {
  const key = norm(en);
  EXACT.set(key, fr);
  const general = key.replace(NUM, '#');
  if (general !== key) GENERAL.set(general, { fr, nums: key.match(NUM) });
}
const KEEP = new Set(catalog.KEEP.map(norm));
const missing = new Map();
const used = new Set();
function miss(s, where) { if (!missing.has(s)) missing.set(s, new Set()); missing.get(s).add(where); return null; }

// Translate one trimmed English string. Returns French or null (recorded as missing).
function tr(s, where, probe = false) {
  s = norm(s);
  if (!s) return s;
  const nums = s.match(NUM) || [];
  const fill = (fr) => typo(fr.replace(/\{(\d)\}/g, (_, i) => fmtNum(nums[+i])));
  if (EXACT.has(s)) { used.add(s); return fill(EXACT.get(s)); }
  if (KEEP.has(s)) return s;
  if (!/[A-Za-z]{2}/.test(s)) return s.replace(NUM, fmtNum);
  const g = GENERAL.get(s.replace(NUM, '#'));
  if (g) {
    used.add(g.nums && s.replace(NUM, '#'));
    if (/\{\d\}/.test(g.fr)) return fill(g.fr);
    if (nums.join() !== g.nums.join()) return probe ? null : miss(s, where + ' (numbers changed: the French wording has no placeholder)');
    return typo(g.fr);
  }
  for (const [re, fn] of catalog.RULES) {
    const m = s.match(re);
    if (m) {
      const sub = (x) => tr(x, where, true);
      const out = fn(m, sub, fmtNum);
      if (out !== null && !/\bnull\b/.test(out)) return typo(out);
    }
  }
  return probe ? null : miss(s, where);
}

// Translate a raw text token, keeping its surrounding whitespace and entity style.
function trText(raw, where, inside) {
  const text = decode(raw);
  const lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0];
  const core = text.trim();
  if (!core) return raw;
  const ctx = catalog.CONTEXT.find((c) => c.en === norm(core) && c.inside.every(inside));
  const fr = ctx ? typo(ctx.fr) : tr(core, where);
  if (fr === null || fr === norm(core)) return raw;
  return encodeText(lead + fr + trail).replace(/ /g, '&nbsp;');
}

// ---------- links ----------
function frHref(href) {
  if (!href || /^(https?:|mailto:|tel:|#|javascript:)/.test(href)) {
    const abs = href && href.startsWith(ORIGIN) ? href.slice(ORIGIN.length) : null;
    return abs !== null ? ORIGIN + frHref(abs || '/') : href;
  }
  const [p, hash = ''] = href.split('#');
  const pathOnly = p.split('?')[0];
  const hashPart = hash ? '#' + hash : '';
  if (pathOnly === '' ) return href;
  if (catalog.LINK_OVERRIDES[href]) return catalog.LINK_OVERRIDES[href];
  if (TRANSLATED.has(pathOnly)) return TRANSLATED.get(pathOnly) + p.slice(pathOnly.length) + hashPart;
  return href;
}

// ---------- WhatsApp messages ----------
function trWhatsApp(href, where) {
  const m = href.match(/^(https:\/\/wa\.me\/\d+)(?:\?text=(.*))?$/);
  if (!m) return href;
  const text = m[2] ? decodeURIComponent(m[2]) : '';
  let fr;
  if (!text) fr = catalog.WHATSAPP_DEFAULT;
  else {
    fr = null;
    for (const [re, fn] of catalog.WHATSAPP) { const mm = text.match(re); if (mm) { fr = fn(mm, (x) => tr(x, where)); break; } }
    if (fr === null) { miss('WhatsApp: ' + text, where); return href; }
  }
  return `${m[1]}?text=${encodeURIComponent(typo(fr)).replace(/'/g, '%27')}`;
}

// ---------- JSON-LD ----------
// Business entities (organisation, lodging business, sister travel agency) are one entity in
// every language, so they keep their English URLs, IDs and address. Page-level items (apartment,
// collection, breadcrumbs, website) point to the French pages and carry French descriptions.
const SHARED_ENTITIES = new Set(['Organization', 'LodgingBusiness', 'TravelAgency']);
function trJsonLd(value, key, where, page) {
  if (Array.isArray(value)) return value.map((v) => trJsonLd(v, key, where, page));
  if (value && typeof value === 'object') {
    if (SHARED_ENTITIES.has(value['@type'])) return value;
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = trJsonLd(v, k, where, page);
    if (['WebSite', 'WebPage', 'CollectionPage', 'Accommodation'].includes(out['@type'])) out.inLanguage = 'fr';
    return out;
  }
  if (typeof value !== 'string') return value;
  if ((key === 'url' || key === 'item') && value.startsWith(ORIGIN)) return frHref(value);
  if (key === '@id' && (value === ORIGIN + page.enPath || value.startsWith(ORIGIN + page.enPath + '#'))) return ORIGIN + page.frPath + value.slice((ORIGIN + page.enPath).length);
  if (['description', 'floorLevel', 'name'].includes(key)) return tr(value, where + ' JSON-LD ' + key) ?? value;
  return value;
}

// ---------- shared asset versions ----------
const hashOf = (rel) => crypto.createHash('sha256').update(read(rel)).digest('hex').slice(0, 12);
const VERSIONED = ['redesign/redesign.js', 'availability-search.js'];
function versionAssets(html) {
  for (const rel of VERSIONED) {
    const re = new RegExp(`(["'(]/${rel.replace(/[.]/g, '\\.')})\\?v=[a-z0-9]+`, 'g');
    html = html.replace(re, `$1?v=${hashOf(rel)}`);
  }
  return html;
}

// ---------- page transform ----------
function hreflangLinks(page) {
  return `<link rel="alternate" hreflang="en" href="${ORIGIN}${page.enPath}"/><link rel="alternate" hreflang="fr" href="${ORIGIN}${page.frPath}"/><link rel="alternate" hreflang="x-default" href="${ORIGIN}${page.enPath}"/>`;
}
const stripHreflang = (html) => html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]+"\/>/g, '');

function buildPage(page) {
  const where = page.fr;
  let html = read(page.en);
  // Page-specific script edits (homepage card renderer) happen on the raw English source first.
  if (catalog.SCRIPT_PATCHES[page.en]) {
    const start = html.indexOf('// ============================================\n// VILLA DATA');
    const end = html.indexOf('</script>', start);
    if (start < 0) throw new Error(page.en + ': homepage script not found');
    let code = html.slice(start, end);
    for (const [from, to] of catalog.SCRIPT_PATCHES[page.en]) {
      if (!code.includes(from)) throw new Error(`${page.en}: script text not found, update catalog.SCRIPT_PATCHES:\n${from.slice(0, 160)}`);
      code = code.split(from).join(to);
    }
    html = html.slice(0, start) + code + html.slice(end);
  }
  for (const rule of catalog.PAGE_PATCHES.filter((r) => r.pages.test(page.en))) {
    for (const [from, to] of rule.patches) {
      if (!html.includes(from)) throw new Error(`${page.en}: text not found, update catalog.PAGE_PATCHES:\n${from.slice(0, 160)}`);
      html = html.split(from).join(to);
    }
  }
  const tokens = tokenize(stripHreflang(html));
  walk(tokens, (t, stack, i) => {
    const inside = (sel) => stack.some((s) => (sel.startsWith('.') ? s.cls.split(/\s+/).includes(sel.slice(1)) : s.name === sel));
    if (t.type === 'text') {
      if (inside('script') || inside('style')) return;
      if (catalog.KEEP_CONTEXT.some((sel) => sel.every(inside))) return;
      t.raw = trText(t.raw, where, inside);
      return;
    }
    if (t.type === 'raw' && t.name === 'script' && /application\/ld\+json/.test(tokens[i - 1].raw)) {
      const data = JSON.parse(t.raw);
      t.raw = JSON.stringify(trJsonLd(data, '', where, page));
      return;
    }
    if (t.type !== 'open') return;
    let tag = t.raw;
    if (t.name === 'html') tag = setAttr(tag, 'lang', 'fr');
    for (const a of ['alt', 'aria-label', 'title', 'placeholder', 'data-tour-name']) {
      const v = getAttr(tag, a);
      if (v && !(a === 'title' && t.name === 'link')) { const fr = tr(decode(v), where + ' @' + a); if (fr !== null) tag = setAttr(tag, a, encodeAttr(fr)); }
    }
    if (t.name === 'meta') {
      const name = getAttr(tag, 'name') || getAttr(tag, 'property') || '';
      const content = getAttr(tag, 'content');
      if (/^(description|og:title|og:description|twitter:title|twitter:description|og:image:alt|twitter:image:alt)$/.test(name)) {
        const fr = tr(decode(content), where + ' meta ' + name); if (fr !== null) tag = setAttr(tag, 'content', encodeAttr(fr));
      }
      if (name === 'og:url') tag = setAttr(tag, 'content', ORIGIN + page.frPath);
      if (name === 'og:locale') tag = setAttr(tag, 'content', 'fr_FR') + `<meta content="en_GB" property="og:locale:alternate"/>`;
    }
    if (t.name === 'link' && getAttr(tag, 'rel') === 'canonical') tag = setAttr(tag, 'href', ORIGIN + page.frPath) + hreflangLinks(page);
    if (t.name === 'a') {
      const href = getAttr(tag, 'href');
      if (href && t.name === 'a') {
        const decoded = decode(href);
        let next = /^https:\/\/wa\.me\//.test(decoded) ? trWhatsApp(decoded, where) : frHref(decoded);
        if (next !== decoded) tag = setAttr(tag, 'href', encodeAttr(next));
      }
    }
    t.raw = tag;
  });
  let out = tokens.map((t) => t.raw).join('');
  // Language switch: one link to the English version, last in the main menu.
  const sw = `<a class="ev-lang-switch" href="${page.enPath}" hreflang="en" lang="en" title="Version anglaise">EN</a>`;
  const navLinks = out.match(/<(div|ul)[^>]*class="nav-links"[^>]*>[\s\S]*?<\/\1>/);
  if (!navLinks) throw new Error(where + ': main menu not found');
  const item = navLinks[1] === 'ul' ? `<li>${sw}</li>` : sw;
  out = out.replace(navLinks[0], navLinks[0].replace(/<\/(div|ul)>$/, item + '</$1>'));
  // Injected script helpers for the homepage renderer (built from the same catalog).
  if (catalog.SCRIPT_DICTIONARY[page.en]) {
    const dict = {};
    for (const s of catalog.SCRIPT_DICTIONARY[page.en](read)) { const fr = tr(s, where + ' script dictionary'); if (fr !== null) dict[s] = fr; }
    const helper = `const FR_TEXT=${JSON.stringify(dict)};const frT=s=>FR_TEXT[s]??s;const frNum=n=>String(n).replace('.',',');const frDate=d=>d?d.split('-').reverse().join('/'):d;\n`;
    out = out.replace('// ============================================\n// VILLA DATA', helper + '// ============================================\n// VILLA DATA');
  }
  return versionAssets(out);
}

// ---------- English counterparts: hreflang + current asset versions ----------
function updateEnglish(page) {
  let html = stripHreflang(read(page.en));
  html = html.replace(/(<link[^>]*rel="canonical"[^>]*>)/, `$1${hreflangLinks(page)}`);
  if (!html.includes('hreflang="fr"')) throw new Error(page.en + ': canonical link not found');
  return html;
}

// ---------- sitemap ----------
function updateSitemap(changed) {
  const file = path.join(ROOT, 'sitemap.xml');
  let xml = fs.readFileSync(file, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const old = new Map([...xml.matchAll(/  <url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>\n/g)].map((m) => [m[1], m[2]]));
  // Only replace the pages this build writes; hand-written French pages (e.g. /fr/privacy/) keep their entries.
  const built = new Set(PAGES.map((p) => ORIGIN + p.frPath));
  xml = xml.replace(/  <url><loc>(https:\/\/egyptvillastours\.com\/fr\/[^<]*)<\/loc>[\s\S]*?<\/url>\n/g, (m, loc) => (built.has(loc) ? '' : m));
  const entries = PAGES.map((p) => {
    const loc = ORIGIN + p.frPath;
    const lastmod = changed.has(p.fr) || !old.has(loc) ? today : old.get(loc);
    const pri = p.frPath === '/fr/' ? '0.9' : '0.8';
    return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${pri}</priority></url>\n`;
  }).join('');
  xml = xml.replace('</urlset>', entries + '</urlset>');
  fs.writeFileSync(file, xml);
}

// ---------- Vercel preview routing (Hostinger uses .htaccess) ----------
function updateVercel() {
  const file = path.join(ROOT, 'vercel.json');
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rewrites = (config.rewrites || []).filter((r) => !r.source.startsWith('/fr/'));
  for (const p of PAGES) {
    if (p.frPath.endsWith('/')) { rewrites.push({ source: p.frPath, destination: '/' + p.fr }); continue; }
    rewrites.push({ source: p.frPath, destination: '/' + p.fr }, { source: p.frPath + '/', destination: '/' + p.fr });
  }
  config.rewrites = rewrites;
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
}

// ---------- run ----------
if (require.main === module) {
  const results = PAGES.map((p) => [p, buildPage(p)]);
  if (missing.size) {
    console.error(`French build stopped: ${missing.size} English wording(s) have no French in seo-build/fr/catalog.js:\n`);
    for (const [s, w] of missing) console.error(`- ${JSON.stringify(s)}\n    on ${[...w].slice(0, 3).join('; ')}`);
    process.exit(1);
  }
  const changed = new Set();
  for (const [p, html] of results) {
    const fp = path.join(ROOT, p.fr);
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    const before = fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : null;
    if (before !== html) { fs.writeFileSync(fp, html); changed.add(p.fr); }
    fs.writeFileSync(path.join(ROOT, p.en), versionAssets(updateEnglish(p)));
  }
  updateSitemap(changed);
  updateVercel();
  // Keep every other page on the current shared-script versions too.
  const all = [];
  const scan = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach((d) => {
    const rel = path.join(dir, d.name);
    if (d.isDirectory() && !/^(\.git|node_modules|seo-build|optimized-assets|villa-assets|tour-assets|restaurant-assets|redesign|brochure|api)$/.test(d.name)) scan(rel);
    else if (d.name.endsWith('.html')) all.push(rel);
  });
  scan('.');
  for (const rel of all) { const html = read(rel), next = versionAssets(html); if (next !== html) fs.writeFileSync(path.join(ROOT, rel), next); }
  const unused = Object.keys(catalog.TEXT).filter((en) => { const k = norm(en); return !used.has(k) && !used.has(k.replace(NUM, '#')); });
  console.log(`Built ${PAGES.length} French pages (${changed.size} changed).`);
  if (unused.length) console.log(`Note: ${unused.length} catalog entries are no longer used on any page:\n` + unused.map((u) => '  - ' + u).join('\n'));
}

module.exports = { PAGES, tr, buildPage, frHref, TRANSLATED };
