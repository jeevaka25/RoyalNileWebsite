"""Apply the approved SEO improvements to the published static redesign.
Idempotent. Requires beautifulsoup4; never invoke the legacy visual generator.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from html import escape as E
import json,re,hashlib,subprocess
ROOT=Path(__file__).resolve().parents[2]
trust=json.loads((ROOT/'trust-data.json').read_text())
inv=json.loads((Path(__file__).parent/'inventory.json').read_text())
for v in inv:v.pop('icalUrl',None)
(Path(__file__).parent/'inventory.json').write_text(json.dumps(inv,indent=2)+'\n')
byid={v['id']:v for v in inv}
originals={
'nile-view-1':[(2,'Shared pool and garden at Royal Nile Villas'),(3,'Sofa and television in Nile View Apartment 1'),(5,'Kitchen and dining space in Nile View Apartment 1'),(6,'Double bedroom in Nile View Apartment 1'),(1,'Royal Nile Villas shared pool at dusk')],
'nile-view-2':[(5,'Royal Nile Villas shared garden and pool overlooking the Nile'),(6,'Double bedroom in Nile View Apartment 2'),(7,'Twin beds in Nile View Apartment 2'),(4,'Shared pool and villa buildings at night'),(1,'Royal Nile Villas shared pool and courtyard'),(2,'Royal Nile Villas garden and pool in daylight')],
}
photos={slug:[f'/optimized-assets/villa-originals/{slug}/{i:02}.webp' for i,_ in rows] for slug,rows in originals.items()}
short=lambda v:v['name'].replace('Royal Nile Villas — ','').replace('Royal Nile Villa — ','').replace('Royal Home Luxor — ','Royal Home ')
compare=['nile-view-luxury-1','nile-view-luxury-2','nile-view-1','nile-view-2']
notes={
'nile-view-luxury-1':'Two queen bedrooms and two bathrooms suit two couples who would like a bathroom each. The second-floor position gives Nile, garden and mountain views.',
'nile-view-luxury-2':'Two queen bedrooms and a private terrace make this a place to settle above the shared pool. Compare it with Luxury Nile View 1 if bathroom count is important to your group.',
'nile-view-1':'Choose the queen-and-twin bed layout when children or friends need separate beds. Ground-floor living and direct access to the shared pool make time outdoors easy.',
'nile-view-2':'A queen bedroom and a twin bedroom offer a flexible layout for a family or friends. Compare the Nile and desert outlook with the garden and mountain outlook of Nile View 1.',
'royal-home-nile-view':'A private entrance and balcony give this top-floor apartment its own rhythm. Royal Home is a separate property from Royal Nile Villas; confirm your arrival address with the host.',
'royal-home-pool-view':'The ground-floor position, private entrance and queen-and-twin layout suit guests who want easy access to the shared pool and rose garden at Royal Home.',
'sky-penthouse-1':'Choose this top-floor apartment for its private terrace and wide Nile and desert outlook. Its queen-and-twin bed layout accommodates up to four guests.',
'sky-penthouse-2':'A top-floor terrace, panoramic outlook and workspace suit a longer stay. Compare the bed layout with the two-queen-bedroom Luxury Nile View apartments below.',
}

def frag(s):return BeautifulSoup(s,'html.parser')
def add(parent,html):
 for x in list(frag(html).contents):parent.append(x)
def meta(s,title=None,description=None):
 if title:
  s.title.string=title
  for x in s.select('meta[property="og:title"],meta[name="twitter:title"]'):x['content']=title
 if description:
  for x in s.select('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]'):x['content']=description

def link(slug,label=None):return f'<a href="/villas/{slug}">{E(label or short(byid[slug]))}</a>'
def comparison():
 return '<div class="seo-comparison" role="region" aria-label="Compare Royal Nile apartments" tabindex="0"><table><caption>Four Royal Nile apartments, four ways to stay</caption><thead><tr><th scope="col">Apartment</th><th scope="col">Floor</th><th scope="col">Beds</th><th scope="col">Bathrooms</th><th scope="col">Outlook</th></tr></thead><tbody>'+''.join(f'<tr><th scope="row">{link(i)}</th><td>{E(byid[i]["floor"])}</td><td>{E(byid[i]["bedsConfig"])}</td><td>{byid[i]["bathrooms"]}</td><td>{E(byid[i]["viewType"])}</td></tr>' for i in compare)+'</tbody></table></div>'

css='''/* SEO content follows the existing luxury design. */
.seo-details{margin:2rem 0;padding:1.5rem 0;border-top:1px solid var(--border,#d5cdbf)}
.seo-details h2,.seo-details h3{margin:0 0 1rem}.seo-details p{margin:0 0 1rem;max-width:72ch}
.seo-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:1.5rem 0}.seo-facts div{border-bottom:1px solid var(--border,#d5cdbf);padding:.6rem 0}.seo-facts dt{font-size:.7rem;text-transform:uppercase;letter-spacing:1px}.seo-facts dd{margin:.4rem 0}
.seo-related{display:flex;gap:.7rem 1.5rem;flex-wrap:wrap;margin:1.2rem 0}.seo-related a{color:inherit;text-decoration:underline;text-underline-offset:4px}
.seo-comparison{overflow-x:auto;margin:1.5rem 0;max-width:100%}.seo-comparison table{width:100%;border-collapse:collapse;font-size:.9rem}.seo-comparison caption{text-align:left;margin-bottom:1rem;font-weight:600}.seo-comparison th,.seo-comparison td{text-align:left;vertical-align:top;padding:.9rem;border-bottom:1px solid var(--border,#d5cdbf)}
.seo-date{font-size:.76rem;opacity:.8}.seo-brand{font-size:.85rem;line-height:1.7;margin:1rem 0}.seo-summary{padding:1.5rem;background:var(--bg-warm,#eee9df);border-left:2px solid #a38e65;margin:1.5rem 0}
@media(max-width:600px){.seo-facts{grid-template-columns:1fr}.seo-comparison th,.seo-comparison td{padding:.6rem;min-width:6rem}.seo-details{padding-top:1rem}}
'''
(ROOT/'redesign/seo.css').write_text(css)
for p in [p for p in ROOT.rglob('*.html') if 'redesign/redesign.css' in p.read_text()]:
 before=p.read_text();s=frag(before);rel=str(p.relative_to(ROOT));canon=s.select_one('link[rel="canonical"]')['href']
 for x in s.select('[data-seo-added]'):x.decompose()
 if not s.select_one('link[href="/redesign/seo.css?v=1"]'):add(s.head,'<link rel="stylesheet" href="/redesign/seo.css?v=1">')
 # A single maintained snapshot; host ratings never become per-property ratings.
 for el in s.select('[data-ev-count]'):
  old=el['data-ev-count']; value=trust['rating'] if '.' in old else trust['yearsHosting'] if int(old)<20 else trust['reviews'];el['data-ev-count']=str(value);el.string=f'{value:,}'
 for el in s.select('.ev-trust'):el['aria-label']="Abdol's Airbnb hosting credentials, checked 3 September 2026"
 schemas=[]
 for el in s.select('script[type="application/ld+json"]'):
  value=json.loads(el.string or el.text);schemas.extend(value if isinstance(value,list) else [value]);el.decompose()
 schemas=[x for x in schemas if x.get('@type') not in ['Product','FAQPage']]
 if rel.startswith('villas/') and rel!='villas/index.html':
  slug=p.stem;v=byid[slug];score=trust['listings'][slug]
  for x in s.select('.meta-row .pill:first-child, .card .rating'):
   suffix=' · '+v['floor'] if 'rating' in x.get('class',[]) else ''
   x.string=f"★ {score['rating']:.2f} · {score['reviews']} Airbnb reviews{suffix}"
  overview=s.select_one('.ev-overview')
  facts=[('Floor',v['floor']),('Bedrooms and beds',f"{v['bedrooms']} bedrooms · {v['bedsConfig']}"),('Bathrooms',str(v['bathrooms'])),('Guests',f"Up to {v['guests']}"),('Outlook',v['viewType']),('Outdoor space','Direct access to the shared pool' if 'Direct Pool Access' in v['features'] else 'Private terrace' if 'Private Terrace' in v['features'] else 'Private balcony' if 'Private Balcony' in v['features'] else 'Shared pool and garden')]
  add(overview,'<section class="seo-details" data-seo-added><h2>Your apartment, in detail</h2><p>'+E(notes[slug])+'</p><dl class="seo-facts">'+''.join(f'<div><dt>{E(k)}</dt><dd>{E(val)}</dd></div>' for k,val in facts)+'</dl><p>For a specific floor area, door width or step-free route, ask us to confirm the measurements for this apartment before booking. A ground-floor label alone does not confirm wheelchair access.</p><p>Choose your exact apartment and dates on Airbnb or Booking.com to see the total price and cancellation conditions. For a direct booking, ask for the written price, deposit and cancellation terms before paying.</p><p class="seo-date">Apartment rating: Airbnb listing snapshot, 3 September 2026. Host-wide credentials above include reviews across the host’s listings.</p><h3>Compare another layout</h3><div class="seo-related">'+''.join(link(i) for i in compare if i!=slug)+'</div></section>')
  if slug in originals:
   cover=photos[slug][0]
   hero=s.select_one('.ev-hero');hero['style']=f"background-image:url('{cover}')";hero.select_one('.ev-hero-image')['src']=cover
   for m in s.select('meta[property="og:image"],meta[name="twitter:image"]'):m['content']='https://egyptvillastours.com'+cover
   gallery=s.select_one('.ev-gallery');gallery.clear()
   for n,(i,caption) in enumerate(originals[slug],1):
    imgpath=f'/optimized-assets/villa-originals/{slug}/{i:02}.webp'
    add(gallery,f'<figure class="ev-photo-card" style="--stack-i:{n}"><div class="ev-photo-inner"><img src="{imgpath}" width="1440" height="1080" alt="{E(caption)}" aria-label="Enlarge {E(caption)}" role="button" tabindex="0" loading="lazy" decoding="async"><figcaption class="ev-photo-caption"><span>{E(caption)}</span><button class="ev-enlarge" type="button">View photograph ↗</button></figcaption></div></figure>')
  for sch in schemas:
   if sch.get('@type')=='Accommodation':
    sch['@id']=canon+'#apartment';sch['floorLevel']=v['floor'];sch['numberOfBedrooms']=v['bedrooms'];sch['numberOfBathroomsTotal']=v['bathrooms'];sch['occupancy']={'@type':'QuantitativeValue','maxValue':v['guests']};sch['sameAs']=[v['airbnbUrl'],v['bookingUrl']];sch['containedInPlace']={'@type':'LodgingBusiness','@id':'https://egyptvillastours.com/#royal-home' if slug.startswith('royal-home') else 'https://egyptvillastours.com/#royal-nile','name':v['propertyGroup'],'url':'https://egyptvillastours.com/villas/'}
    sch['amenityFeature']=[{'@type':'LocationFeatureSpecification','name':f,'value':True} for f in v['features'] if not re.search('Rated|Favourite',f)]
    if slug in photos:sch['image']=['https://egyptvillastours.com'+x for x in photos[slug]]
 if rel=='villas/index.html':
  meta(s,'Luxor West Bank Apartments With Pool | Royal Nile Villas','Compare eight Luxor West Bank apartments with shared pools, Nile views and two bedrooms. Choose your floor and beds, check dates and plan your stay.')
  section=s.select_one('.choice-section');add(section,'<section class="seo-details" data-seo-added><h2>Find the layout that fits your stay</h2>'+comparison()+'<p>All four sleep up to four guests and use the shared pool at Royal Nile Villas. Tell us if stairs, bathroom count or separate beds are important before you reserve.</p></section>')
  for slug in originals:
   for img in s.select(f'#{slug} img'):img['src']=photos[slug][0]
 if rel.startswith('egypt-travel-guide/') and rel!='egypt-travel-guide/index.html':
  body=s.select_one('.article-body');slug=p.parent.name
  if body and any(x in slug for x in ['stay','apartment','accommodation']):
   add(body,'<section class="article-section seo-details" data-seo-added><h2>Choose a Royal Nile apartment for your plans</h2><p>For separate beds and easy pool access, compare '+link('nile-view-1')+' and '+link('nile-view-2')+'. If you prefer two queen bedrooms on an upper floor, compare '+link('nile-view-luxury-1')+' (two bathrooms) with '+link('nile-view-luxury-2')+' (private terrace). These are individual apartments with a shared pool; check your exact dates and requirements before booking.</p></section>')
  if body and slug in ['luxor-total-solar-eclipse-2027','where-to-stay-luxor-solar-eclipse-2027','luxor-eclipse-2027-tour-itinerary']:
   links=[('luxor-total-solar-eclipse-2027','Eclipse date, local times and duration'),('where-to-stay-luxor-solar-eclipse-2027','Choose your eclipse accommodation'),('luxor-eclipse-2027-tour-itinerary','Arrange your days around the eclipse')]
   html='<nav class="seo-related" aria-label="Eclipse planning" data-seo-added>'+''.join(f'<a href="/egypt-travel-guide/{i}/">{l}</a>' for i,l in links if i!=slug)+'<a href="/tours/luxor-solar-eclipse-2027-package">Four-night eclipse stay: inclusions and booking</a></nav>'
   body.insert(0,frag(html))
   titles={'luxor-total-solar-eclipse-2027':'Luxor Eclipse 2027: Local Times & Duration | Royal Nile','where-to-stay-luxor-solar-eclipse-2027':'Where to Stay in Luxor for Eclipse 2027 | Royal Nile','luxor-eclipse-2027-tour-itinerary':'Luxor Eclipse 2027: Five-Day Itinerary | Royal Nile'}
   meta(s,titles[slug])
   if slug=='luxor-total-solar-eclipse-2027':
    desc='Luxor’s eclipse is on 2 August 2027, with maximum near 13:05 local time and about 6m 22s of totality. Check timings and plan your Nile-side stay.';meta(s,description=desc)
    body.insert(0,frag('<section class="seo-summary" data-seo-added><h2>What time is the 2027 eclipse in Luxor?</h2><p>On <strong>Monday 2 August 2027</strong>, maximum eclipse in Luxor is expected at about <strong>13:05 local time (EEST)</strong>. The partial phase runs approximately 11:40–14:26; totality lasts about <strong>6 minutes 22 seconds</strong>. Exact contact times depend on your viewing coordinates.</p><p><a href="https://www.timeanddate.com/eclipse/in/egypt/luxor?iso=20270802" target="_blank" rel="noopener">Check the current Luxor calculations</a> · Checked 9 September 2026.</p><p>Planning a stay? <a href="/tours/luxor-solar-eclipse-2027-package">See our four-night accommodation package, transfers and booking terms.</a></p></section>'))
 if rel=='index.html':
  # Distinguish the operating brand from its two lodging properties.
  schemas=[x for x in schemas if x.get('@type')!='LodgingBusiness' and x.get('@id')!='https://egyptvillastours.com/#organization']
  schemas.extend([{'@context':'https://schema.org','@type':'Organization','@id':'https://egyptvillastours.com/#organization','name':'Royal Nile Villas','url':'https://egyptvillastours.com/','telephone':'+201204421652','email':'royalhomeluxor@gmail.com','subOrganization':{'@type':'TravelAgency','name':'Egyptian Tours by Royal Nile Villas','url':'https://www.egyptian.tours/'}},{'@context':'https://schema.org','@type':'LodgingBusiness','@id':'https://egyptvillastours.com/#royal-nile','name':'Royal Nile Villas','url':'https://egyptvillastours.com/villas/','sameAs':['https://share.google/P6PPmkbxRYg6QhLie'],'address':{'@type':'PostalAddress','addressLocality':'Al Aqaletah, Luxor West Bank','addressCountry':'EG'}},{'@context':'https://schema.org','@type':'LodgingBusiness','@id':'https://egyptvillastours.com/#royal-home','name':'Royal Home Luxor','url':'https://egyptvillastours.com/villas/royal-home-nile-view','sameAs':['https://share.google/xxd26OMK5AOtsgYik'],'address':{'@type':'PostalAddress','addressLocality':'Luxor West Bank','addressCountry':'EG'}}])
  tours=s.select_one('#tours .section-header') or s.select_one('#tours');add(tours,'<p class="seo-brand" data-seo-added>Your apartment is your Luxor base. For a wider private itinerary, our sister site <a href="https://www.egyptian.tours/">Egyptian Tours</a> brings together locally arranged journeys in Luxor, Cairo and Upper Egypt.</p>')
 # Proper physical dimensions for local images prevent layout shifts.
 from PIL import Image
 for img in s.select('img[src^="/optimized-assets/villa-originals/"]'):
  with Image.open(ROOT/img['src'].lstrip('/')) as im:img['width']=im.width;img['height']=im.height
 for img in s.select('img[loading="lazy"]'):img['decoding']='async'
 for sch in schemas:
  if sch.get('@type')=='Article' and rel.startswith('egypt-travel-guide/'):
   sch['description']=s.select_one('meta[name="description"]')['content']
   if 'data-seo-added' in str(s):
    sch['dateModified']='2026-09-09'
    for byline in s.select('.article-meta, .byline, .hero .meta'):
     for t in byline.find_all(string=re.compile('Updated')):
      t.replace_with(re.sub(r'Updated[^·|<]*', 'Updated 9 September 2026 ', str(t)))
 if schemas:add(s.head,'<script type="application/ld+json">'+json.dumps(schemas,ensure_ascii=False).replace('</','<\\/')+'</script>')
 output=str(s)
 p.write_text(output)
print('Applied apartment comparisons, contextual links, entity cleanup and eclipse targeting.')
