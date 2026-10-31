"""31 October 2026 audit fixes. Idempotent, targeted string edits of the published HTML.
Run from the repository root:
    python3 seo-build/seo-2026-10/apply_oct31.py
    node seo-build/seo-2026-09/prerender.cjs
    python3 seo-build/seo-2026-10/apply_oct31.py   # second run refreshes sitemap dates only
"""
import json, re, subprocess, datetime
from html import escape
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
TODAY = datetime.date.today().isoformat()
LINKEDIN = 'https://www.linkedin.com/in/egypt-villas-tours/'
OLD_LINKEDIN = 'https://sg.linkedin.com/in/private-equity-recruitment'
AIRBNB_HOST = 'https://www.airbnb.co.uk/users/show/252258998'          # Abdol, as on the homepage hosts section
GOOGLE_MAPS = 'https://maps.google.com/?cid=12798265813486767809'      # Royal Nile Villas Business Profile
LOGO_PATH = 'optimized-assets/brand/royal-nile-villas-logo-512.png'
RESTAURANT_TITLE = 'Royal Skylounge | Nile-View Rooftop Restaurant, Luxor'
changed = []
def read(rel): return (ROOT / rel).read_text()
def write(rel, new):
    if read(rel) != new: (ROOT / rel).write_text(new); changed.append(rel)
def attr(s): return escape(s, quote=False).replace('"', '&quot;')

# 1. Restaurant: working email address and a title that keeps "Nile-view restaurant".
h = read('restaurant.html')
h = h.replace('href="mailto:info@egyptvillastours.com"', 'href="mailto:royalhomeluxor@gmail.com"')
# Footer "Airbnb Profile" pointed at an unrelated guest's profile; use the host profile shown on the homepage.
h = h.replace('<a href="https://www.airbnb.co.uk/users/show/157757016" target="_blank">Airbnb Profile</a>',
              f'<a href="{AIRBNB_HOST}" rel="noopener" target="_blank">Airbnb Profile</a>')
h = re.sub(r'<title>[^<]*</title>', f'<title>{escape(RESTAURANT_TITLE, quote=False)}</title>', h, count=1)
for name in ('property="og:title"', 'name="twitter:title"'):
    h = re.sub(r'<meta content="[^"]*" %s/>' % re.escape(name), f'<meta content="{attr(RESTAURANT_TITLE)}" {name}/>', h)
write('restaurant.html', h)

# 2. Meet your hosts: Jeevaka's current LinkedIn address (link and Person markup).
write('meet-your-hosts/index.html', read('meet-your-hosts/index.html').replace(OLD_LINKEDIN, LINKEDIN))

# 3. Homepage Organization markup: logo and official profiles. Logo drawn from favicon.svg.
logo = ROOT / LOGO_PATH
if not logo.exists():
    logo.parent.mkdir(parents=True, exist_ok=True)
    k = 8; S = 64 * k
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=14 * k, fill='#147481')
    d.line([(16 * k, 46 * k), (16 * k, 18 * k), (32 * k, 36 * k), (32 * k, 18 * k)], fill='#fcfbf7', width=5 * k, joint='curve')
    for x, y in [(16, 46), (16, 18), (32, 36), (32, 18)]:
        r = 2.5 * k; d.ellipse([x * k - r, y * k - r, x * k + r, y * k + r], fill='#fcfbf7')
    d.ellipse([41 * k, 17 * k, 51 * k, 27 * k], fill='#c8a45d')
    im.save(logo, optimize=True)
    changed.append(LOGO_PATH)
h = read('index.html')
m = re.search(r'(<script type="application/ld\+json">)([\s\S]*?)(</script>)', h)
data = json.loads(m.group(2))
for item in data:
    if item.get('@id') == 'https://egyptvillastours.com/#organization':
        item['logo'] = 'https://egyptvillastours.com/' + LOGO_PATH
        item['sameAs'] = [GOOGLE_MAPS, AIRBNB_HOST, LINKEDIN]
h = h[:m.start(2)] + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + h[m.end(2):]

# 4. Homepage script: build apartment links without a "/villas/${...}" pattern that Google reads as a URL.
h = h.replace('href="/villas/${villa.id}"', 'href="${\'/villas/\'+villa.id}"')
write('index.html', h)

# 5. Hero photo alt text on tour and apartment pages (the page title describes the photo).
for p in sorted(list((ROOT / 'tours').glob('*.html')) + list((ROOT / 'villas').glob('*.html'))):
    rel = p.relative_to(ROOT).as_posix(); h = read(rel)
    if rel == 'tours/index.html':
        alt = 'Guide and guests at the Temple of Ramesses II, Abu Simbel'
    else:
        h1 = re.search(r'<h1[^>]*>([\s\S]*?)</h1>', h)
        if not h1: continue
        alt = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', h1.group(1))).strip()
        alt = alt.replace('&amp;', '&')
    h = re.sub(r'<img alt="" class="ev-hero-image"', f'<img alt="{attr(alt)}" class="ev-hero-image"', h, count=1)
    write(rel, h)

# 6. Sitemap lastmod = the date each page's file last changed (today if changed in this release).
def file_for(loc):
    path = loc.replace('https://egyptvillastours.com/', '')
    if path == '' or path.endswith('/'): return path + 'index.html'
    return path if path.endswith('.html') else path + '.html'
dirty = set(subprocess.run(['git', 'diff', '--name-only', 'HEAD'], cwd=ROOT, capture_output=True, text=True).stdout.split())
sm = read('sitemap.xml')
def bump(mo):
    loc, old = mo.group(1), mo.group(2)
    f = file_for(loc)
    if f in dirty: new = TODAY
    else: new = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', f], cwd=ROOT, capture_output=True, text=True).stdout.strip() or old
    return f'<loc>{loc}</loc><lastmod>{max(new, old)}</lastmod>'
write('sitemap.xml', re.sub(r'<loc>([^<]+)</loc><lastmod>([^<]+)</lastmod>', bump, sm))

print('Changed:', *sorted(set(changed)), sep='\n  ')
