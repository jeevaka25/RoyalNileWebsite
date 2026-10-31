#!/usr/bin/env python3
"""Publish the Ramses II statues article (31 October 2026).

Idempotent. Builds the article page from the balloon-restart page template,
writes seo-build/ramses-ii-article.json, registers it in travel-guide-data.js,
adds a card + ItemList entry to the guide hub and a sitemap entry.
Does NOT run the legacy generate-travel-guide.js (it would re-serialise pages).
"""
import json, re, os, html as H

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SITE = 'https://egyptvillastours.com'
TODAY = '2026-10-31'
SLUG = 'ramses-ii-statues-discovery-luxor'
URL = f'{SITE}/egypt-travel-guide/{SLUG}/'
IMG = '/optimized-assets/travel-guide/ramses-ii-ramesseum-illustration-1600.jpg'
WA = 'https://wa.me/201204421652'

ART = {
    'slug': SLUG,
    'title': 'Two Colossal Ramses II Statues Found in Egypt: Where to See His Giants in Luxor',
    'seoTitle': 'Ramses II Statues Found in Egypt: Where to See Him in Luxor',
    'description': "A farmer's find led to two colossal Ramses II statues in the Nile Delta. What was found, how old Ramses was, and where to see his giants in Luxor.",
    'dek': 'A villager’s inscribed stone led archaeologists to two giant statues of Ramses II. They will be studied for some time — but in Luxor you can stand beside his colossi today.',
    'image': IMG,
    'imageAlt': 'Illustration of a fallen colossal statue of Ramses II among temple columns on Luxor’s West Bank at sunrise, with a hot air balloon in the sky',
    'imageCaption': 'Illustration: Ramses II’s fallen giant at the Ramesseum on Luxor’s West Bank. Not a photograph of the new find.',
    'readTime': '7 min read',
    'datePublished': TODAY,
    'dateModified': TODAY,
    'updated': TODAY,
    'sections': [],
    'tips': [
        'The new statues are not open to visitors yet.',
        'See his colossi at Luxor Temple and the Ramesseum.',
        'Visit Luxor Temple from late afternoon into the evening.',
        'Nefertari’s tomb needs a separate, timed ticket.',
    ],
    'ctaTitle': 'Plan a Ramses II day in Luxor',
    'ctaBody': 'Send your dates and party size. We can arrange a West Bank stay and private guided visits to his temples.',
}

T = lambda p, label: f'<a href="{p}">{label}</a>'
BODY = f"""<p>It started with a pink stone. In October 2026, a villager in Behbeit El-Hagar, in Egypt’s Nile Delta, was working on land outside his home when he hit an inscribed block. He reported it to the local antiquities office. Rescue excavations by the Supreme Council of Antiquities then uncovered the remains of two colossal statues of <strong>Ramses II</strong>, Egypt’s most famous builder-king.</p>
<p>The new statues will be studied for some time before anyone can see them. Luxor is different. Here you can stand in front of Ramses II’s giants today, at his own temples on both banks of the Nile.</p>
<h2>What was found at Behbeit El-Hagar</h2>
<table>
<thead><tr><th scope="col"></th><th scope="col">What the Ministry reported</th></tr></thead>
<tbody>
<tr><th scope="row">Where</th><td>Behbeit El-Hagar village, Gharbia Governorate, Nile Delta</td></tr>
<tr><th scope="row">Announced</th><td>Mid-October 2026, by Egypt’s Ministry of Tourism and Antiquities</td></tr>
<tr><th scope="row">Statue 1</th><td>A colossal head about 1.6 m tall, wearing the double crown of Upper and Lower Egypt. Part of the back pillar carries Ramses II’s Horus name. The full statue, with its base, is estimated at about 8.5 m.</td></tr>
<tr><th scope="row">Statue 2</th><td>About 2.4 m survives, wearing the nemes headdress. The legs and base are missing. The face closely resembles the first statue, and it is tentatively identified as Ramses II.</td></tr>
<tr><th scope="row">Also found</th><td>A pink granite block about 1.3 m long, inscribed with the royal titles “King of Upper and Lower Egypt” and “Son of Ra”</td></tr>
</tbody>
</table>
<p>Behbeit El-Hagar is best known for a temple of the goddess Isis, built about a thousand years after Ramses II. So the big question now is whether his statues first stood here or were moved here later. Egyptian kings often reused older statues. Archaeologists will study the inscriptions, the carving and the ground around the finds. Egyptologist Mahmoud Emam, of Cairo University, told Live Science that earlier finds at the site already suggested Ramses II carried out major building work there.</p>
<p>The site is not open to visitors. The statues stay with the archaeologists while they are recorded and conserved.</p>
<h2>Who was Ramses II? Quick answers</h2>
<ul>
<li><strong>When he ruled:</strong> about 1279 to 1213 BC, for 66 years. That is one of the longest reigns of any pharaoh.</li>
<li><strong>How old he was when he died:</strong> about 90. Most of his subjects had never known another king.</li>
<li><strong>His family:</strong> he is thought to have had around 100 children. His best-known queen was Nefertari.</li>
<li><strong>War and peace:</strong> he fought the Hittites at the Battle of Kadesh in about 1274 BC. About 16 years later he signed a peace treaty with them. Copies survive in both Egyptian and Hittite versions.</li>
<li><strong>Ozymandias:</strong> Greek writers called him Ozymandias, from his throne name. Shelley’s famous poem was inspired by his fallen statue at the Ramesseum in Luxor.</li>
</ul>
<h3>Did Ramses II’s mummy really get a passport?</h3>
<p>It’s a famous story, but there’s no record of one. In 1976 his mummy was flown to Paris for conservation and welcomed with military honours, then returned to Egypt in 1977. The “passport” was most likely the heavy pile of paperwork for the trip. Today the mummy is in the National Museum of Egyptian Civilization in Cairo.</p>
<h2>Where to see Ramses II in Luxor</h2>
<h3>1. Luxor Temple (East Bank)</h3>
<p>Ramses II gave Luxor Temple its entrance: the great front gateway (pylon), the colossal seated and standing statues in front of it, and the open court behind. He also set up two obelisks here. One still stands at the gate. The other has stood in the Place de la Concorde in Paris since 1836. Go in the late afternoon and stay as the temple lights come on. See it on our {T('/tours/karnak-luxor-temple-tour', 'Karnak &amp; Luxor Temple tour')}.</p>
<h3>2. Karnak Temple (East Bank)</h3>
<p>The forest of giant columns in Karnak’s Great Hypostyle Hall was begun under his father, Seti I, and finished and decorated by Ramses II. Look for his name in the carved cartouches high on the columns. It is also on our {T('/tours/karnak-luxor-temple-tour', 'Karnak &amp; Luxor Temple tour')}.</p>
<h3>3. The Ramesseum (West Bank)</h3>
<p>This was Ramses II’s own memorial temple, his “House of Millions of Years”. Its fallen colossus is thought to have stood about 19 m tall and weighed around 1,000 tonnes. This is the broken giant behind Shelley’s poem. The walls show the Battle of Kadesh. It is far quieter than the big sites, so you often have it almost to yourself. Ask us to add it to a private {T('/tours/valley-of-the-kings-tour', 'Valley of the Kings &amp; West Bank day')}.</p>
<h3>4. The tomb of Queen Nefertari (Valley of the Queens, West Bank)</h3>
<p>Ramses II built this tomb for his favourite queen. Its wall paintings are among the finest in Egypt. It needs a separate ticket and visits are timed, so check the current price before you go.</p>
<h2>Ramses II beyond Luxor</h2>
<ul>
<li><strong>Abu Simbel:</strong> his two rock-cut temples, one for himself and one for Nefertari, opened in about 1255 BC. {T('/tours/abu-simbel-tour', 'Abu Simbel from Luxor')}</li>
<li><strong>Abydos:</strong> Ramses II built his own temple beside his father’s at Abydos. {T('/tours/abydos-dendera-tour', 'Abydos &amp; Dendera day trip')}</li>
<li><strong>The Grand Egyptian Museum, Giza:</strong> his colossal statue greets visitors in the Grand Hall. From 1 November 2026 the foreign adult ticket is US$35. {T('/tours/grand-egyptian-museum-tour', 'Grand Egyptian Museum tour')}</li>
</ul>
<h2>A one-day Ramses II trail from the West Bank</h2>
<ol>
<li><strong>Early morning:</strong> the Ramesseum, before the heat and the coaches.</li>
<li><strong>Late morning:</strong> the Valley of the Kings, or Hatshepsut’s temple at Deir el-Bahari.</li>
<li><strong>Afternoon:</strong> a rest by the pool, then cross the Nile.</li>
<li><strong>Sunset:</strong> Luxor Temple, from golden hour into the floodlit evening.</li>
</ol>
<h2>FAQ: the Ramses II statues and his monuments in Luxor</h2>
<h3>Where were the new Ramses II statues found?</h3>
<p>At Behbeit El-Hagar in Gharbia Governorate, in the Nile Delta north of Cairo. A villager found an inscribed stone on his land and reported it.</p>
<h3>Can I see the new statues?</h3>
<p>Not yet. They are being studied and conserved, and the site is not open to visitors. In Luxor you can see his colossi at Luxor Temple and the Ramesseum.</p>
<h3>How old was Ramses II when he died?</h3>
<p>About 90, after ruling for 66 years.</p>
<h3>Did Ramses II’s mummy get a passport?</h3>
<p>There is no record of one. The story probably comes from the paperwork for the mummy’s 1976 trip to Paris.</p>
<h3>Where is Ramses II’s mummy now?</h3>
<p>In the National Museum of Egyptian Civilization in Cairo.</p>
<h3>What is the best place in Luxor to see Ramses II?</h3>
<p>Luxor Temple for his colossi and obelisk, and the Ramesseum for his fallen giant.</p>
<h2>Plan your Luxor trip</h2>
<p>Stay on the West Bank and the Ramesseum, the Valley of the Kings and Hatshepsut’s temple are all close by, with Luxor Temple just across the river. {T('/villas/', 'Compare our Luxor villas')} or {T('/tours/', 'add a private tour to your stay')}. <a href="{WA}">Message us on WhatsApp</a> to check availability.</p>
<section class="sources"><h2>Sources and further reading</h2><ul>
<li><a href="https://www.heritagedaily.com/2026/10/archaeologists-uncover-colossal-statues-of-ramses-ii-in-egypt/159585" rel="noopener" target="_blank">HeritageDaily: Archaeologists uncover colossal statues of Ramses II in Egypt</a> (13 October 2026)</li>
<li><a href="https://www.livescience.com/archaeology/ancient-egyptians/2-giant-ramesses-ii-statues-one-wearing-a-double-crown-discovered-by-man-in-egypt" rel="noopener" target="_blank">Live Science: 2 giant Ramesses II statues discovered in Egypt</a> (15 October 2026)</li>
<li><a href="https://en.wikipedia.org/wiki/Ramesses_II" rel="noopener" target="_blank">Ramesses II</a>, <a href="https://en.wikipedia.org/wiki/Ramesseum" rel="noopener" target="_blank">Ramesseum</a> and <a href="https://en.wikipedia.org/wiki/Luxor_Obelisks" rel="noopener" target="_blank">Luxor Obelisks</a> (Wikipedia)</li>
<li><a href="https://egyptdailynews.com/grand-egyptian-museum-to-raise-admission/" rel="noopener" target="_blank">Egypt Daily News: Grand Egyptian Museum admission from 1 November 2026</a></li>
</ul></section>
<p><em>Published 31 October 2026. We will update this page when the Ministry publishes more about the Behbeit El-Hagar statues.</em></p>
"""
ART['bodyHtml'] = BODY


def rd(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def wr(p, s):
    open(os.path.join(ROOT, p), 'w', encoding='utf-8').write(s)


def must_sub(pattern, repl, s, count=1, flags=re.S):
    new, n = re.subn(pattern, lambda m: repl, s, count=count, flags=flags)
    assert n == count, f'pattern not found: {pattern[:60]}'
    return new


# 1. JSON + data registry
json.dump(ART, open(os.path.join(ROOT, 'seo-build/ramses-ii-article.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
data = rd('seo-build/travel-guide-data.js')
if 'ramses-ii-article.json' not in data:
    data = data.replace("const ARTICLES = [\n", "const ARTICLES = [\n  require('./ramses-ii-article.json'),\n", 1)
    assert 'ramses-ii-article.json' in data
    wr('seo-build/travel-guide-data.js', data)

# 2. Article page from the balloon template
tpl = rd('egypt-travel-guide/luxor-balloon-flights-restart-september-2026/index.html')
e = H.escape
t, d = e(ART['seoTitle'], quote=True), e(ART['description'], quote=True)
img_abs = SITE + IMG
page = tpl
page = must_sub(r'<title>.*?</title><meta content="[^"]*" name="description"/><link href="[^"]*" rel="canonical"/>',
                f'<title>{t}</title><meta content="{d}" name="description"/><link href="{URL}" rel="canonical"/>', page)
page = must_sub(r'<meta content="Luxor Balloon[^"]*" property="og:title"/>.*?property="og:image"/>',
                f'<meta content="{t}" property="og:title"/><meta content="{d}" property="og:description"/><meta content="{URL}" property="og:url"/><meta content="{img_abs}" property="og:image"/><meta content="1600" property="og:image:width"/><meta content="900" property="og:image:height"/><meta content="{e(ART["imageAlt"], quote=True)}" property="og:image:alt"/>', page)
page = must_sub(r'<meta content="Luxor Balloon[^"]*" name="twitter:title"/>.*?name="twitter:image"/>',
                f'<meta content="{t}" name="twitter:title"/><meta content="{d}" name="twitter:description"/><meta content="{img_abs}" name="twitter:image"/>', page)
ld = [
    {"@context": "https://schema.org", "@type": "Article", "headline": ART['title'], "description": ART['description'],
     "image": img_abs, "datePublished": TODAY, "dateModified": TODAY,
     "author": {"@type": "Organization", "name": "Royal Nile Villas"},
     "publisher": {"@type": "Organization", "name": "Royal Nile Villas", "url": SITE, "@id": SITE + "/#organization"},
     "mainEntityOfPage": URL,
     "about": [{"@type": "Person", "name": "Ramesses II", "sameAs": "https://en.wikipedia.org/wiki/Ramesses_II"},
               {"@type": "Place", "name": "Ramesseum", "sameAs": "https://en.wikipedia.org/wiki/Ramesseum"}]},
    {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
        {"@type": "ListItem", "position": 2, "name": "Egypt Travel Guide", "item": SITE + "/egypt-travel-guide/"},
        {"@type": "ListItem", "position": 3, "name": ART['title'], "item": URL}]},
]
page = must_sub(r'<script type="application/ld\+json">.*?</script>',
                '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>', page)
page = page.replace('<style>.article-body>p{', '<style>.article-body table{margin:0 0 1.6rem}.article-body th,.article-body td{border-bottom:1px solid var(--border-light);padding:.7rem .6rem;text-align:left;vertical-align:top}.article-body tbody th{white-space:nowrap;color:var(--text)}.article-body>h3{font-size:1.3rem;margin:1.6rem 0 .5rem}.article-body>p{', 1)
page = must_sub(r'<img alt="[^"]*" class="ev-hero-image"[^>]*/>',
                f'<img alt="{e(ART["imageAlt"], quote=True)}" class="ev-hero-image" decoding="async" fetchpriority="high" height="900" src="{IMG}" width="1600"/>', page)
page = must_sub(r'<span class="kicker">Egypt Travel Guide · [^<]*</span><h1>.*?</h1><p class="dek">.*?</p><p class="meta">.*?</p>',
                f'<span class="kicker">Egypt Travel Guide · {ART["readTime"]}</span><h1>{e(ART["title"])}</h1><p class="dek">{e(ART["dek"])}</p><p class="meta">Published 31 October 2026 · Updated 31 October 2026</p>', page)
page = must_sub(r'› Balloon flights restart</nav>', '› Ramses II statues found</nav>', page)
page = must_sub(r'<div class="article-body">.*?<a class="back" href="/egypt-travel-guide/">',
                f'<div class="article-body"><p><em>{e(ART["imageCaption"])}</em></p>{BODY}<a class="back" href="/egypt-travel-guide/">', page)
tips = ''.join(f'<li>{e(x)}</li>' for x in ART['tips'])
wa_text = 'Hello%2C%20I%20read%20your%20Ramses%20II%20article%20and%20would%20like%20to%20plan%20a%20Luxor%20stay%20with%20temple%20visits.'
page = must_sub(r'<aside class="aside">.*?</aside>',
                f'<aside class="aside"><section class="aside-card"><span class="kicker">Before you go</span><ul class="tips">{tips}</ul></section><section class="aside-card cta"><h2>{e(ART["ctaTitle"])}</h2><p>{e(ART["ctaBody"])}</p><a class="btn" href="{WA}?text={wa_text}" rel="noopener" target="_blank">Check availability →</a></section></aside>', page)
for leftover in ('Balloon flights restart', 'balloon morning', 'Sunrise above Luxor', 'luxor-balloon-restart'):
    assert leftover not in page, 'template leftover: ' + leftover
os.makedirs(os.path.join(ROOT, f'egypt-travel-guide/{SLUG}'), exist_ok=True)
wr(f'egypt-travel-guide/{SLUG}/index.html', page)

# 3. Hub card + ItemList
hub = rd('egypt-travel-guide/index.html')
if SLUG not in hub:
    card = (f'<a class="card" href="/egypt-travel-guide/{SLUG}/"><img alt="Illustration of Ramses II’s fallen colossus at the Ramesseum, Luxor" loading="lazy" '
            f'src="/optimized-assets/travel-guide/ramses-ii-ramesseum-illustration-800.webp" width="800" height="450"/><div class="card-content">'
            f'<span class="kicker">31 October 2026 · {ART["readTime"]}</span><h2>{e(ART["title"])}</h2><p>{e(ART["dek"])}</p><span class="read">Read article →</span></div></a>')
    hub = must_sub(r'<div class="cards">', '<div class="cards">' + card, hub)
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', hub, re.S)
    items = json.loads(m.group(1))
    lst = next(x for x in items if x.get('@type') == 'ItemList')
    lst['itemListElement'].insert(0, {"@type": "ListItem", "position": 1, "name": ART['title'], "url": URL})
    for i, it in enumerate(lst['itemListElement'], 1):
        it['position'] = i
    hub = hub[:m.start(1)] + json.dumps(items, ensure_ascii=False) + hub[m.end(1):]
    wr('egypt-travel-guide/index.html', hub)

# 4. Sitemap
sm = rd('sitemap.xml')
if SLUG not in sm:
    hub_entry = re.search(r'<url><loc>https://egyptvillastours.com/egypt-travel-guide/</loc><lastmod>[^<]*</lastmod>(.*?)</url>', sm)
    assert hub_entry
    new_hub = f'<url><loc>{SITE}/egypt-travel-guide/</loc><lastmod>{TODAY}</lastmod>{hub_entry.group(1)}</url>'
    new_art = f'\n<url><loc>{URL}</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>'
    sm = sm.replace(hub_entry.group(0), new_hub + new_art, 1)
    wr('sitemap.xml', sm)
print('Ramses II article ready:', URL)
