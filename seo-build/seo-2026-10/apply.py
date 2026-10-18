"""October 2026 SEO audit follow-up for egyptvillastours.com.

Idempotent, string-level edits of the published static HTML. It never re-serialises
whole pages (unlike tuneup.py), so unrelated markup stays byte-for-byte unchanged.
Run from the repository root:  python3 seo-build/seo-2026-10/apply.py
Inputs: content.json (titles, alts, captions) and tour-depth.json (tour copy).
"""
import json, re
from html import escape
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
C = json.loads((HERE / 'content.json').read_text())
DEPTH = json.loads((HERE / 'tour-depth.json').read_text())
TODAY = '2026-10-18'
changed = []

def E(s): return escape(s, quote=False).replace('"', '&quot;')
def T(s): return escape(s, quote=False)
def read(rel): return (ROOT / rel).read_text()
def write(rel, new):
    if read(rel) != new:
        (ROOT / rel).write_text(new); changed.append(rel)
def html_files():
    for p in sorted(ROOT.rglob('*.html')):
        rel = p.relative_to(ROOT).as_posix()
        if rel.startswith(('.git/', 'seo-build/', 'tmp/', 'redesign/', 'api/')): continue
        yield rel

def mark(key, html): return f'<!-- seo-oct:{key} -->{html}<!-- /seo-oct:{key} -->'
def unmark(h, key): return re.sub(r'<!-- seo-oct:%s -->[\s\S]*?<!-- /seo-oct:%s -->' % (re.escape(key), re.escape(key)), '', h)
def put_before(h, anchor, key, html):
    h = unmark(h, key)
    assert anchor in h, f'anchor missing: {anchor[:60]}'
    i = h.index(anchor)
    return h[:i] + mark(key, html) + h[i:]

def set_meta_content(h, attr, name, value):
    """Replace content= of <meta (name|property)=name>, whatever the attribute order."""
    def rep(m):
        tag = m.group(0)
        return re.sub(r'content="[^"]*"', 'content="%s"' % E(value).replace('\\', '\\\\'), tag, count=1)
    pat = r'<meta(?=[^>]*\b%s="%s")[^>]*>' % (attr, re.escape(name))
    new, n = re.subn(pat, rep, h)
    return new, n

def set_title(h, title):
    h, n = re.subn(r'<title>[^<]*</title>', '<title>%s</title>' % T(title).replace('\\', '\\\\'), h, count=1)
    assert n == 1
    return h

def set_alt(tag, alt, aria=None):
    tag = re.sub(r'\balt="[^"]*"', 'alt="%s"' % E(alt), tag, count=1)
    if aria is not None and 'aria-label="' in tag:
        tag = re.sub(r'\baria-label="[^"]*"', 'aria-label="%s"' % E(aria), tag, count=1)
    return tag


# 1. Titles and descriptions: "Luxor villas" on the villa collection, a brand-first
#    homepage title, and eclipse guides aimed at the queries they already rank for.
for rel, m in C['titles'].items():
    h = read(rel)
    if 'title' in m:
        h = set_title(h, m['title'])
        if rel != 'index.html':  # homepage social titles were approved separately
            for attr, name in [('property', 'og:title'), ('name', 'twitter:title')]:
                h, _ = set_meta_content(h, attr, name, m['title'])
    if 'description' in m:
        for attr, name in [('name', 'description'), ('property', 'og:description'), ('name', 'twitter:description')]:
            h, _ = set_meta_content(h, attr, name, m['description'])
    write(rel, h)

h = read('villas/index.html')
h = h.replace('<h1>Nile-view apartments<br/>&amp; villas in <em>Luxor.</em></h1>', '<h1>%s</h1>' % C['villas_h1'])
write('villas/index.html', h)

# Descriptive internal anchors pointing at /villas/.
for rel in html_files():
    h = read(rel)
    h = h.replace('<a href="/villas/">Compare all ' + 'apartments</a>', '<a href="/villas/">Compare all Luxor villas</a>')
    h = h.replace('<a href="/villas/">Compare all eight Luxor ' + 'apartments</a>', '<a href="/villas/">Compare all eight Luxor villas</a>')
    write(rel, h)


# 2. Homepage tour cards for the two Cairo tours (prerender.cjs then emits crawlable links).
CAIRO_JS = """,
  { id:'cairo-pyramids', name:'Cairo Pyramids & Sphinx', icon:'🔺', desc:'Stand before the Pyramids of Giza and the Great Sphinx with a private Egyptologist guide and Cairo or Giza hotel pickup.',
    details:'Stand beneath the Great Pyramid, meet the gaze of the Sphinx and watch the desert open around monuments that have fascinated travellers for centuries. Your private Egyptologist guide brings their stories to life, with time for the Giza panorama and photographs at your own pace. Private air-conditioned transfers from your Cairo or Giza hotel keep the journey simple. This tour starts in Cairo or Giza, not Luxor.',
    priceNote:'Price confirmed on WhatsApp',
    included:['The Pyramids of Giza and the Great Sphinx','Panoramic views across the Giza Plateau','Private Egyptologist guide','Private air-conditioned vehicle with driver','Pickup and drop-off at your Cairo or Giza hotel','Entrance tickets extra'],
    coverImage:'tour-assets/cairo/04-great-sphinx-giza.webp',
    photos:[
      'tour-assets/cairo/01-private-arrival-giza.webp',
      'tour-assets/cairo/02-giza-panorama-viewpoint.webp',
      'tour-assets/cairo/03-great-pyramid-stonework.webp',
      'tour-assets/cairo/04-great-sphinx-giza.webp',
      'tour-assets/cairo/05-valley-temple-approach.webp',
      'tour-assets/cairo/06-giza-golden-hour-return.webp'
    ]},
  { id:'grand-egyptian-museum', name:'Grand Egyptian Museum Tour', icon:'🏺', desc:'Three hours of guided discovery among the treasures of the Grand Egyptian Museum in Giza.',
    details:'Step into the world of pharaohs, extraordinary craftsmanship and lives lived thousands of years ago. Over three hours at the Grand Egyptian Museum, your guide connects the objects with the people and stories behind them. There is time to pause, ask questions and follow your curiosity. Message us for tickets, your meeting point and optional hotel transfers.',
    priceNote:'Price confirmed on WhatsApp',
    included:['Three hours of guided discovery','Stories behind ancient Egyptian artefacts and royal monuments','A focused route through museum highlights','Time for questions and a relaxed pace','Pairs well with the Giza Pyramids tour'],
    coverImage:'tour-assets/cairo/02-gem-grand-hall.webp',
    photos:[
      'tour-assets/cairo/01-gem-exterior.jpg',
      'tour-assets/cairo/02-gem-grand-hall.webp',
      'tour-assets/cairo/03-gem-grand-staircase.webp',
      'tour-assets/cairo/04-gem-ancient-craftsmanship.webp',
      'tour-assets/cairo/05-gem-royal-sculpture.webp'
    ]}"""
h = read('index.html')
if "id:'cairo-pyramids'" not in h:
    start = h.index("{ id:'abydos-dendera'")
    end = h.index("]}\n);", start) + 2
    h = h[:end] + CAIRO_JS + h[end:]
old_map = "'abydos-dendera':'abydos-dendera-tour'};"
if "'cairo-pyramids':" not in h.split('const TOUR_PAGE=')[1][:900]:
    assert old_map in h
    h = h.replace(old_map, "'abydos-dendera':'abydos-dendera-tour','cairo-pyramids':'cairo-pyramids-sphinx-tour','grand-egyptian-museum':'grand-egyptian-museum-tour'};", 1)
write('index.html', h)


# 3. Eclipse cluster: one consistent anchor to the package, and the package links back to every guide.
PKG = '/tours/luxor-solar-eclipse-2027-package'
for slug, _ in C['eclipse_guides']:
    rel = f'egypt-travel-guide/{slug}/index.html'
    h = read(rel)
    h = h.replace(f'<a href="{PKG}">Four-night eclipse stay: inclusions and booking</a>', f'<a href="{PKG}">{T(C["package_anchor"])}</a>')
    h = re.sub(r'("dateModified": ?")2026-09-09(")', r'\g<1>%s\2' % TODAY, h)
    write(rel, h)

rel = 'egypt-travel-guide/luxor-eclipse-2027-tour-itinerary/index.html'
h = read(rel)
extra = ''.join(f'<li><a href="{u}">{T(t)}</a></li>' for u, t in [
    (PKG, C['package_anchor'].capitalize()),
    ('/tours/cairo-pyramids-sphinx-tour', 'Cairo Pyramids & Sphinx tour'),
    ('/tours/aswan-philae-temple-tour', 'Aswan & Philae day trip from Luxor'),
    ('/tours/abu-simbel-tour', 'Abu Simbel day trip from Luxor'),
    ('/tours/sunset-nile-boat-cruise', 'Sunset Nile boat cruise with dinner')])
anchor = '<li><a href="/villas/">Compare all eight Luxor villas</a></li>'
h = put_before(h, anchor, 'itinerary-links', extra)
write(rel, h)

rel = 'tours/luxor-solar-eclipse-2027-package.html'
h = read(rel)
links = ''.join(f'<a href="/egypt-travel-guide/{s}/">{T(t)}</a>' for s, t in C['eclipse_guides'])
block = f'<section class="seo-details" aria-label="Plan your eclipse trip"><h2>Plan your eclipse trip</h2><p>Local timings, where to stay and how to shape the days around 2 August 2027.</p><div class="seo-related">{links}</div></section>'
h = put_before(h, '<div class="mobile-booking-card">', 'eclipse-guides', block)
write(rel, h)


# 4. Deeper tour pages: what you see, how the day flows, practical notes and extra FAQs.
for slug, d in DEPTH.items():
    rel = f'tours/{slug}.html'
    h = read(rel)
    body = d['section'].replace('<ol>', '<ol class="ev-steps">').replace('<ul>', '<ul class="checklist">')
    h = put_before(h, '<div class="mobile-booking-card">', 'depth', f'<section class="seo-details ev-tour-depth">{body}</section>')
    faqs = ''.join(f'<div class="faq"><h3>{T(q)}</h3><p>{T(a)}</p></div>' for q, a in d['faqs'])
    h = unmark(h, 'faqs')
    m = re.search(r'<section class="ev-faqs">[\s\S]*?(</section>)', h)
    h = h[:m.start(1)] + mark('faqs', faqs) + h[m.start(1):]
    write(rel, h)

# Links from the private-tour planning guide to the longer day trips.
rel = 'egypt-travel-guide/private-luxor-tour-planning-guide/index.html'
h = read(rel)
sec = re.search(r'<h2>Longer excursions deserve their own day</h2>[\s\S]*?(</section>)', h)
p = ('<p>Our private day trips from Luxor: <a href="/tours/abydos-dendera-tour">Abydos &amp; Dendera temples</a>, '
     '<a href="/tours/aswan-philae-temple-tour">Aswan &amp; Philae</a> and <a href="/tours/abu-simbel-tour">Abu Simbel</a>. '
     'For an easy evening between them, take the <a href="/tours/sunset-nile-boat-cruise">sunset Nile boat cruise with dinner</a>.</p>')
h = unmark(h, 'day-trips')
sec = re.search(r'<h2>Longer excursions deserve their own day</h2>[\s\S]*?(</section>)', h)
h = h[:sec.start(1)] + mark('day-trips', p) + h[sec.start(1):]
write(rel, h)

# 5. Gallery captions and alt text that describe each photo (previously generated from
#    highlight lists, so alt text and photos did not match).
for slug, rows in C['gallery'].items():
    rel = f'tours/{slug}.html'
    h = read(rel)
    figs = list(re.finditer(r'<figure class="ev-photo-card"[\s\S]*?</figure>', h))
    assert len(figs) == len(rows), (slug, len(figs), len(rows))
    out, last = [], 0
    for m, row in zip(figs, rows):
        fig = m.group(0)
        fig = re.sub(r'(<figcaption class="ev-photo-caption"><span>)[^<]*(</span>)', lambda x: x.group(1) + T(row[0]) + x.group(2), fig)
        if len(row) > 1:
            fig = re.sub(r'<img[^>]*>', lambda x: set_alt(x.group(0), row[1], 'Enlarge ' + row[1]), fig, count=1)
        out.append(h[last:m.start()] + fig); last = m.end()
    write(rel, ''.join(out) + h[last:])

# 6. Alt text: hero photos, and collection-card images whose links had no accessible name.
for rel in html_files():
    h = read(rel)
    def hero(m):
        tag = m.group(0); src = re.search(r'src="([^"]+)"', tag).group(1)
        return set_alt(tag, C['hero_alts'][src]) if src in C['hero_alts'] and 'alt=""' in tag else tag
    h = re.sub(r'<img(?=[^>]*class="ev-hero-image")[^>]*>', hero, h)
    if rel in ('villas/index.html', 'tours/index.html'):
        def card(m):
            block = m.group(0)
            name = re.search(r'<h3[^>]*>(?:<a[^>]*>)?([^<]+)', block).group(1).strip()
            alt = name + (", Luxor West Bank" if rel.startswith('villas') else '')
            return re.sub(r'(<a[^>]*class="inventory-image"[^>]*>\s*)(<img[^>]*>)', lambda x: x.group(1) + (set_alt(x.group(2), alt) if 'alt=""' in x.group(2) else x.group(2)), block, count=1)
        h = re.sub(r'<article class="inventory-card"[\s\S]*?</article>', card, h)
    write(rel, h)


# 7. Intrinsic width/height on local images whose CSS sets a fixed height
#    (related cards, guide cards, restaurant gallery). Not applied where CSS sizes the
#    image by aspect-ratio or width alone, because the attribute would then fix its height.
SIZED = (r'class="related-card"', r'class="card', r'class="gallery-grid"')
dims_cache = {}
def dims(src):
    path = ROOT / src.split('?')[0].lstrip('/')
    if src not in dims_cache:
        dims_cache[src] = Image.open(path).size if path.exists() else None
    return dims_cache[src]
for rel in html_files():
    h = read(rel)
    def add_dims(m):
        container, inner = m.group(1), m.group(2)
        def fix(t):
            tag = t.group(0)
            if 'width=' in tag or 'height=' in tag: return tag
            src = re.search(r'src="(/[^"]+)"', tag)
            d = src and dims(src.group(1))
            return tag[:-2] + f' width="{d[0]}" height="{d[1]}"/>' if d and tag.endswith('/>') else tag
        return container + re.sub(r'<img[^>]*>', fix, inner)
    for cls in SIZED:
        h = re.sub(r'(<(?:a|div)[^>]*%s[^>]*>)([\s\S]*?</(?:a|div)>)' % cls, add_dims, h)
    write(rel, h)


# Card-sized images. Collection, related and homepage tour cards display at most ~800 CSS px
# wide but loaded 1,536-1,672 px originals (250-400 KB each). Serve 960 px WebP copies.
CARD_DIR = ROOT / 'optimized-assets/cards'
def card_copy(src):
    path = ROOT / src.split('?')[0].lstrip('/')
    if not path.exists() or path.suffix.lower() not in ('.webp', '.jpg', '.jpeg', '.png'):
        return None
    with Image.open(path) as im:
        if im.width <= 1000:
            return None
        out = CARD_DIR / f'{path.parent.name}-{path.stem}-960.webp'
        if not out.exists():
            CARD_DIR.mkdir(parents=True, exist_ok=True)
            im.convert('RGB').resize((960, round(im.height * 960 / im.width)), Image.LANCZOS).save(out, 'WEBP', quality=80, method=6)
        return '/' + out.relative_to(ROOT).as_posix()
def swap_src(tag):
    m = re.search(r'src="([^"]+)"', tag)
    new = m and card_copy(m.group(1))
    if not new: return tag
    return tag.replace(m.group(0), f'src="{new}"', 1)
for rel in html_files():
    h = read(rel)
    h = re.sub(r'(<a[^>]*class="(?:related-card|inventory-image)"[^>]*>\s*)(<img[^>]*>)', lambda x: x.group(1) + swap_src(x.group(2)), h)
    write(rel, h)
# Homepage tour cards come from CLEAN_TOUR_COVERS; prerender.cjs copies them into the markup.
h = read('index.html')
m = re.search(r'const CLEAN_TOUR_COVERS=(\{[^;]*\});', h)
covers = json.loads(m.group(1))
covers.setdefault('cairo-pyramids', '/tour-assets/cairo/04-great-sphinx-giza.webp')
covers.setdefault('grand-egyptian-museum', '/tour-assets/cairo/02-gem-grand-hall.webp')
covers = {k: (card_copy(v) or v) if not v.startswith('/optimized-assets/cards/') else v for k, v in covers.items()}
h = h[:m.start(1)] + json.dumps(covers) + h[m.end(1):]
write('index.html', h)

# Homepage entity markup: the Egyptian Tours TravelAgency needs an address (Google
# rich-results error), and the lodging entities gain the image, phone and map position
# shown on the Google Business Profile.
h = read('index.html')
m = re.search(r'(<script type="application/ld\+json">)([\s\S]*?)(</script>)', h)
data = json.loads(m.group(2))
cover = re.search(r'/optimized-assets/villa-assets/imagen-enhanced/royal-home-nile-view-covers/[^"\']+', read('villas/index.html')).group(0)
for item in data:
    if item.get('@id') == 'https://egyptvillastours.com/#organization':
        item['subOrganization'].update({'telephone': '+201204421652', 'address': {'@type': 'PostalAddress', 'addressLocality': 'Al Aqaletah, Luxor West Bank', 'addressRegion': 'Luxor', 'addressCountry': 'EG'}})
    if item.get('@id') == 'https://egyptvillastours.com/#royal-nile':
        item.update({'image': 'https://egyptvillastours.com/optimized-assets/performance/royal-nile-hero-fallback-20261009.jpg', 'telephone': '+201204421652',
                     'address': {'@type': 'PostalAddress', 'streetAddress': 'Jorf Albairat', 'addressLocality': 'Al Aqaletah, Luxor West Bank', 'addressRegion': 'Luxor', 'postalCode': '1345110', 'addressCountry': 'EG'},
                     'geo': {'@type': 'GeoCoordinates', 'latitude': 25.691162, 'longitude': 32.623042}})
    if item.get('@id') == 'https://egyptvillastours.com/#royal-home':
        item.update({'image': 'https://egyptvillastours.com' + cover, 'telephone': '+201204421652'})
h = h[:m.start(2)] + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + h[m.end(2):]
write('index.html', h)


# Styles for the new tour sections live in redesign/seo.css (also written by tuneup.py).
CSS = (".ev-tour-depth h3{font-size:20px;margin:28px 0 10px}.ev-tour-depth p{max-width:72ch}"
       ".ev-steps{list-style:none;counter-reset:step;display:grid;gap:10px;margin:14px 0 6px;padding:0}"
       ".ev-steps li{counter-increment:step;position:relative;padding:0 0 10px 2.2rem;border-bottom:1px solid var(--border,#d5cdbf);font-size:14px}"
       ".ev-steps li::before{content:counter(step);position:absolute;left:0;top:0;font-family:var(--font-display);color:#a38e65;font-size:1.1rem}\n")
css = (ROOT / 'redesign/seo.css').read_text()
if '.ev-steps' not in css:
    (ROOT / 'redesign/seo.css').write_text(css + CSS); changed.append('redesign/seo.css')
for rel in html_files():
    write(rel, read(rel).replace('/redesign/seo.css?v=1"', '/redesign/seo.css?v=2"'))

# 8. Sitemap lastmod for pages whose visible content changed meaningfully in this release.
sm = read('sitemap.xml')
CONTENT_CHANGES = ['index.html', 'villas/index.html', 'tours/index.html', 'tours/abydos-dendera-tour.html', 'tours/abu-simbel-tour.html',
    'tours/sunset-nile-boat-cruise.html', 'tours/luxor-solar-eclipse-2027-package.html',
    'egypt-travel-guide/luxor-total-solar-eclipse-2027/index.html', 'egypt-travel-guide/where-to-stay-luxor-solar-eclipse-2027/index.html',
    'egypt-travel-guide/luxor-eclipse-2027-tour-itinerary/index.html', 'egypt-travel-guide/private-luxor-tour-planning-guide/index.html']
for rel in CONTENT_CHANGES:
    if rel.endswith('index.html'):
        loc = 'https://egyptvillastours.com/' + rel[:-len('index.html')]
    else:
        loc = 'https://egyptvillastours.com/' + rel[:-len('.html')] if not rel.endswith('restaurant.html') else 'https://egyptvillastours.com/restaurant.html'
    sm = re.sub(r'(<loc>%s</loc><lastmod>)[^<]*(</lastmod>)' % re.escape(loc), lambda x: x.group(1) + TODAY + x.group(2), sm)
write('sitemap.xml', sm)

print('Changed files:'); [print(' ', c) for c in sorted(set(changed))]
