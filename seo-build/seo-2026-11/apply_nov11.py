"""11 November 2026 homepage SEO tune-up (idempotent targeted string edits).

Run from the repository root:
    python3 seo-build/seo-2026-11/apply_nov11.py
    node seo-build/seo-2026-09/prerender.cjs
    node seo-build/fr/build-fr.js

Owner-confirmed facts used here (Jay, 11 Nov 2026): shuttle to the West Bank ferry runs 8am-10pm
daily including weekends; airport pickup USD 20 total, one way; check-in 1pm, check-out 11am;
local place name spelled "Jorf El Bairat"; all eight apartments have private kitchens.
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
INDEX = ROOT / 'index.html'
s = INDEX.read_text()
orig = s

def swap(old, new, count=1):
    global s
    if new in s and old not in s:
        return  # already applied
    n = s.count(old)
    if n != count:
        sys.exit(f'expected {count} x {old[:70]!r}, found {n}')
    s = s.replace(old, new)

TITLE = 'Luxor Nile-View Apartments &amp; Penthouses | Royal Nile Villas'
DESC = ("Nile-view apartments and penthouses on Luxor's West Bank, 15 minutes from the Valley of the "
        "Kings. Airbnb Superhost. Now booking for the 2027 eclipse.")

# 1. Title and descriptions
swap('<title>Royal Nile Villas | Luxury Nile-View Villas in Luxor, Egypt</title>', f'<title>{TITLE}</title>')
old_desc = "Luxury Nile-view apartments and penthouses on Luxor's West Bank, now offering a dedicated accommodation package for the 2 August 2027 total solar eclipse."
swap(f'<meta content="{old_desc}" name="description"/>', f'<meta content="{DESC}" name="description"/>')
swap(f'<meta content="{old_desc}" property="og:description"/>', f'<meta content="{DESC}" property="og:description"/>')
swap('<meta content="Luxury Nile-view stays on Luxor\'s West Bank, including a dedicated accommodation package for the 2 August 2027 total solar eclipse." name="twitter:description"/>',
     f'<meta content="{DESC}" name="twitter:description"/>')

# 2. Local spelling in the location paragraph
swap('All our properties are located in Al Aqaletah, surrounded by sugar cane fields',
     'All our properties are located in Al Aqaletah (Jorf El Bairat), surrounded by sugar cane fields')

# 2b. Self-catering (owner confirmed 11 Nov 2026: all eight apartments have private kitchens)
swap('<p class="amenities-copy">Relaxed resort-style comforts, practical guest services, and thoughtful details across our Royal Nile Villas apartments.</p>',
     '<p class="amenities-copy">Self-catering apartments, each with a private kitchen, and a rooftop restaurant on site when you would rather not cook.</p>')

# 3. Card alt text describing each card picture (falls back to the name)
VILLA_ALTS = {
 'royal-home-nile-view': 'Pool in front of the white two-storey building with arched terraces at Royal Home Luxor',
 'royal-home-pool-view': 'Pool beside the arched ground-floor terraces at Royal Home Luxor — Pool View',
 'sky-penthouse-1': 'Nile, felucca sails and the Luxor skyline seen over the garden and pool from Sky Penthouse 1',
 'sky-penthouse-2': 'Living room and kitchen opening onto a terrace with a Nile view in Sky Penthouse 2',
 'nile-view-luxury-1': 'Covered balcony looking over the pool, palms and fields to the Nile at Luxury Nile View 1',
 'nile-view-1': 'Pool and lawn below the three-storey Royal Nile Villas building',
 'nile-view-luxury-2': 'Date palm in the garden with the Nile and Luxor\'s East Bank behind',
 'nile-view-2': 'Pool, sun loungers and garden path at dusk with the lights of Luxor across the Nile',
}
TOUR_ALTS = {
 'eclipse-2027': 'Artist’s impression of the total eclipse over the Nile from the Royal Nile Villas terrace',
 'balloon': 'Hot-air balloon passengers watching sunrise over Luxor’s West Bank',
 'west-bank': 'The Colossi of Memnon below the Theban hills on Luxor’s West Bank',
 'east-bank': 'Carved columns and an obelisk in golden morning light on Luxor’s East Bank',
 'desert': 'Quad bikes on a desert track below the Theban cliffs',
 'abu-simbel': 'The seated colossi of Ramesses II at the Great Temple of Abu Simbel',
 'aswan': 'Pylon and colonnade of the Temple of Isis at Philae, near Aswan',
 'nile-boat-cruise': 'Felucca on the Nile at sunset with palms and temple columns on the shore',
 'red-sea': 'Two snorkellers over a coral reef with tropical fish in the Red Sea',
 'abydos-dendera': 'Hathor-headed columns on the façade of Dendera Temple',
 'cairo-pyramids': 'The Great Sphinx with a pyramid behind it at Giza',
 'grand-egyptian-museum': 'Colossal statue of Ramesses II in the Grand Egyptian Museum’s Grand Hall',
}
js = lambda d: json.dumps(d, ensure_ascii=False)
swap('alt="${villa.name}" width="800"', 'alt="${VILLA_CARD_ALTS[villa.id]||villa.name}" width="800"')
swap('alt="${t.name}" width="800"', 'alt="${TOUR_CARD_ALTS[t.id]||t.name}" width="800"')
s = re.sub(r'const VILLA_CARD_ALTS=\{.*?\};\n', '', s)
s = re.sub(r'const TOUR_CARD_ALTS=\{.*?\};\n', '', s)
# inside renderVillas so every script slice that copies the renderer (prerender, checks) gets it
FN = 'function renderVillas(villaStatuses, ci, co) {\n'
assert s.count(FN) == 1, 'renderVillas signature'
s = s.replace(FN, FN + f'const VILLA_CARD_ALTS={js(VILLA_ALTS)};\n')
swap('function renderTours() {', f'const TOUR_CARD_ALTS={js(TOUR_ALTS)};\nfunction renderTours() {{')

# 4. FAQ before the location section (each answer adds a fact not stated elsewhere on the page)
FAQ = [
 ('Is the pool shared?', 'Yes. Guests share the pool and the Nile-side garden; each apartment is your own private space.'),
 ('When does the free ferry shuttle run?', 'Every day from 8am to 10pm, weekends included. The ride to the West Bank ferry takes about 15 minutes.'),
 ('Can you arrange an airport pickup?', 'Yes. A private transfer from Luxor Airport costs USD 20 in total, one way, and takes about 20 minutes.'),
 ('What are the check-in and check-out times?', 'Check-in is from 1pm and check-out is by 11am.'),
]
faq_html = ('<section class="ev-faqs" id="faq"><!-- seo-nov11:faq -->\n<h2>Frequently asked questions</h2>'
            + ''.join(f'<div class="faq"><h3>{q}</h3><p>{a}</p></div>' for q, a in FAQ) + '\n</section>')
s = re.sub(r'<section class="ev-faqs" id="faq"><!-- seo-nov11:faq -->.*?</section>', '', s, flags=re.S)
swap('<section class="section" data-sc-act="flow" id="location">', faq_html + '<section class="section" data-sc-act="flow" id="location">')
faq_css = '.ev-faqs .faq{border-top:1px solid var(--border-light)}.ev-faqs .faq p{color:var(--text-secondary)}/* seo-nov11 */'
if faq_css not in s:
    i = s.index('</style>'); s = s[:i] + faq_css + s[i:]

# 5. Schema: check-in/out on both lodging entries; amenities on Royal Nile Villas
def ld_edit(text):
    def fix(m):
        data = json.loads(m.group(1)); items = data if isinstance(data, list) else [data]
        for it in items:
            if it.get('@type') != 'LodgingBusiness': continue
            it['checkinTime'] = '13:00'; it['checkoutTime'] = '11:00'
            if it.get('@id') == 'https://egyptvillastours.com/#royal-home':
                # Google Maps pin "Royal Home Villa" supplied by Jay, 11 Nov 2026
                it['geo'] = {'@type': 'GeoCoordinates', 'latitude': 25.6986166, 'longitude': 32.6298814}
            if it.get('@id') == 'https://egyptvillastours.com/#royal-nile':
                it['amenityFeature'] = [{'@type': 'LocationFeatureSpecification', 'name': n, 'value': True} for n in
                    ['Free WiFi', 'Private kitchen', 'Swimming pool', 'Garden', 'Air conditioning', 'Free daily housekeeping',
                     'Nile-view rooftop restaurant', 'Free shuttle to the West Bank ferry', 'Airport transfer', 'Free parking']]
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'
    return re.sub(r'<script type="application/ld\+json">(\[[^<]*?LodgingBusiness[^<]*?)</script>', fix, text, count=1)
s2 = ld_edit(s)
if s2 == s and '"checkinTime"' not in s: sys.exit('LodgingBusiness JSON-LD not found')
s = s2

if s != orig:
    INDEX.write_text(s); print('index.html updated')
else:
    print('index.html already up to date')

# keep the October content.json title in step so apply.py cannot revert it
cj = ROOT / 'seo-build/seo-2026-10/content.json'
c = cj.read_text()
c2 = c.replace('"index.html": {"title": "Royal Nile Villas | Luxury Nile-View Villas in Luxor, Egypt"}',
               '"index.html": {"title": "Luxor Nile-View Apartments & Penthouses | Royal Nile Villas"}')
if c2 != c: cj.write_text(c2); print('content.json title updated')
