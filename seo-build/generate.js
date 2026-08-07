/* eslint-disable */
// Builds SEO landing pages, sitemap.xml, and the vercel rewrites block
// from seo-build/data.js. Run: node seo-build/generate.js
const fs = require('fs');
const path = require('path');
const { SITE, TOURS, VILLAS, wa, optimizedImage, siteAsset } = require('./data.js');

const ROOT = path.join(__dirname, '..');
const ORIGIN = SITE.origin;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const img = (s) => optimizedImage(s);
const abs = (p) => ORIGIN + (p.startsWith('/') ? p : '/' + p);

// ---------- shared chrome ----------
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`;

const BASE_CSS = `
:root{--bg:#fcfbf7;--bg-warm:#f4f0e7;--card:#fff;--primary:#147481;--primary-dark:#0d5862;--teal:#147481;--gold:#c8a45d;--text:#1f2a2c;--text-secondary:#5d6969;--text-muted:#8d9895;--border:#e7e0d1;--border-light:#f0eadf;--shadow:0 4px 20px rgba(0,0,0,.06);--shadow-lg:0 12px 40px rgba(0,0,0,.1);--radius:14px;--radius-lg:20px;--font-display:'Playfair Display',Georgia,serif;--font-body:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}body{font-family:var(--font-body);background:var(--bg);color:var(--text);line-height:1.7;-webkit-font-smoothing:antialiased;}
a{color:var(--primary);text-decoration:none;}a:hover{text-decoration:underline;}
img{max-width:100%;display:block;}
.nav{position:sticky;top:0;z-index:100;background:rgba(254,253,251,.94);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);}
.nav-inner{max-width:1100px;margin:0 auto;padding:.9rem 1.5rem;display:flex;align-items:center;justify-content:space-between;}
.nav-logo{font-family:var(--font-display);font-size:1.3rem;font-weight:700;color:var(--text);}.nav-logo span{color:var(--primary);}
.nav-links{display:flex;gap:1.4rem;align-items:center;font-size:.78rem;font-weight:600;letter-spacing:.5px;text-transform:uppercase;}
.nav-links a{color:var(--text-secondary);}.nav-cta{background:var(--primary);color:#fff!important;padding:.5rem 1.1rem;border-radius:50px;}.nav-cta:hover{background:var(--primary-dark);text-decoration:none;}
.wrap{max-width:1100px;margin:0 auto;padding:0 1.5rem;}
.crumbs{font-size:.78rem;color:var(--text-muted);padding:1.2rem 0 0;}
.hero{position:relative;border-radius:var(--radius-lg);overflow:hidden;margin:1.2rem 0 2rem;min-height:380px;display:flex;align-items:flex-end;background:var(--text) center/cover no-repeat;}
.hero video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.hero::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.62));}
.hero-inner{position:relative;z-index:1;padding:2rem;color:#fff;}
.eyebrow{font-size:.72rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:.5rem;}
h1{font-family:var(--font-display);font-size:clamp(2rem,4.5vw,3.1rem);line-height:1.12;font-weight:700;}
.hero h1{color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.5);max-width:760px;}
.meta-row{display:flex;flex-wrap:wrap;gap:1rem;margin-top:1rem;font-size:.85rem;}
.meta-row .pill{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);padding:.25rem .8rem;border-radius:50px;}
.layout{display:grid;grid-template-columns:1fr 320px;gap:2.5rem;align-items:start;margin-bottom:3rem;}
.lede{font-size:1.08rem;color:var(--text-secondary);margin-bottom:1.6rem;}
h2{font-family:var(--font-display);font-size:1.6rem;font-weight:700;margin:1.8rem 0 .9rem;color:var(--text);}
.checklist{list-style:none;display:grid;gap:.55rem;}
.checklist li{position:relative;padding-left:1.6rem;color:var(--text-secondary);}
.checklist li::before{content:'✓';position:absolute;left:0;color:var(--primary);font-weight:700;}
.note{background:var(--bg-warm);border-left:3px solid var(--gold);padding:.9rem 1.1rem;border-radius:8px;font-size:.9rem;color:var(--text-secondary);margin:1.2rem 0;}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin:1.4rem 0;}
.gallery img{width:100%;height:200px;object-fit:cover;border-radius:10px;cursor:zoom-in;transition:opacity .2s,transform .2s;}
.gallery img:hover{opacity:.92;transform:scale(1.01);}
.lightbox{display:none;position:fixed;inset:0;z-index:1000;background:rgba(10,13,13,.93);align-items:center;justify-content:center;padding:2rem;}
.lightbox.open{display:flex;}
.lightbox img{max-width:min(94vw,1400px);max-height:86vh;object-fit:contain;border-radius:10px;box-shadow:var(--shadow-lg);}
.lightbox-close{position:absolute;top:1.1rem;right:1.1rem;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.14);color:#fff;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.14);color:#fff;font-size:1.5rem;cursor:pointer;}
.lightbox-prev{left:1.2rem;}.lightbox-next{right:1.2rem;}
@media(max-width:600px){.lightbox-nav{display:none;}}
.faq{border-top:1px solid var(--border-light);padding:1rem 0;}
.faq h3{font-size:1rem;font-weight:600;margin-bottom:.35rem;color:var(--text);}
.faq p{color:var(--text-secondary);font-size:.92rem;}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.4rem;box-shadow:var(--shadow);position:sticky;top:90px;}
.card h3{font-family:var(--font-display);font-size:1.2rem;margin-bottom:.4rem;}
.card .rating{color:var(--gold);font-weight:600;margin-bottom:.8rem;font-size:.9rem;}
.btn{display:block;text-align:center;padding:.8rem 1.2rem;border-radius:50px;font-weight:600;font-size:.85rem;margin-top:.6rem;transition:.2s;}
.btn:hover{text-decoration:none;transform:translateY(-1px);}
.btn-primary{background:var(--primary);color:#fff;}.btn-primary:hover{background:var(--primary-dark);}
.btn-outline{border:1.5px solid var(--primary);color:var(--primary);}.btn-outline:hover{background:var(--primary);color:#fff;}
.btn-3d{position:relative;isolation:isolate;overflow:hidden;border:0;color:#fff!important;text-shadow:0 1px 1px rgba(0,0,0,.2);transform:translateY(0);}
.btn-3d::after{content:'';position:absolute;z-index:1;top:-70%;left:-75%;width:38%;height:240%;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(255,255,255,.68),transparent);transform:rotate(18deg);animation:button-sheen 4.8s ease-in-out infinite;}
.btn-3d:hover{color:#fff!important;text-decoration:none;transform:translateY(-2px);filter:saturate(1.06);}
.btn-3d:active{transform:translateY(4px);}
.btn-whatsapp{background:linear-gradient(145deg,#39dc78,#159447);box-shadow:0 6px 0 #0d6f35,0 11px 22px rgba(18,140,70,.28);}
.btn-whatsapp:hover{background:linear-gradient(145deg,#45e486,#168b45);box-shadow:0 8px 0 #0d6f35,0 14px 28px rgba(18,140,70,.32);}
.btn-whatsapp:active{box-shadow:0 2px 0 #0d6f35,0 5px 12px rgba(18,140,70,.24);}
.btn-airbnb{background:linear-gradient(145deg,#ff6b70,#e33d47);box-shadow:0 6px 0 #b82f37,0 11px 22px rgba(227,61,71,.26);}
.btn-airbnb:hover{background:linear-gradient(145deg,#ff777c,#dd3540);box-shadow:0 8px 0 #b82f37,0 14px 28px rgba(227,61,71,.3);}
.btn-airbnb:active{box-shadow:0 2px 0 #b82f37,0 5px 12px rgba(227,61,71,.22);}
.btn-booking{background:linear-gradient(145deg,#1683d8,#075aa7);box-shadow:0 6px 0 #06427a,0 11px 22px rgba(0,83,159,.27);}
.btn-booking:hover{background:linear-gradient(145deg,#2491e3,#07569d);box-shadow:0 8px 0 #06427a,0 14px 28px rgba(0,83,159,.31);}
.btn-booking:active{box-shadow:0 2px 0 #06427a,0 5px 12px rgba(0,83,159,.22);}
@keyframes button-sheen{0%,68%{left:-75%;}88%,100%{left:145%;}}
@media(prefers-reduced-motion:reduce){.btn-3d::after{animation:none;}}
.mobile-top-actions{display:none;}
.mobile-booking-card{display:none;margin:1.6rem 0 1.9rem;}
.mobile-booking-card .card{position:static;}
.mobile-whatsapp-fab{display:none;}
.related{margin:2rem 0 3rem;}
.related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;}
.related-card{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:var(--card);}
.related-card img{height:130px;width:100%;object-fit:cover;}
.related-card span{display:block;padding:.7rem .9rem;font-weight:600;font-size:.9rem;color:var(--text);}
.footer{border-top:1px solid var(--border);background:var(--bg-warm);margin-top:2rem;}
.footer-inner{max-width:1100px;margin:0 auto;padding:2.5rem 1.5rem;display:grid;grid-template-columns:2fr 1fr 1fr;gap:2rem;}
.footer h4{font-family:var(--font-display);font-size:1.2rem;margin-bottom:.5rem;}.footer h4 span{color:var(--primary);}
.footer p{font-size:.82rem;color:var(--text-muted);max-width:320px;}
.footer h5{font-size:.7rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--primary);margin-bottom:.7rem;}
.footer ul{list-style:none;}.footer li{margin-bottom:.4rem;}.footer a{color:var(--text-secondary);font-size:.84rem;}
.footer-bottom{max-width:1100px;margin:0 auto;padding:1rem 1.5rem 2rem;font-size:.74rem;color:var(--text-muted);border-top:1px solid var(--border);}
@media(max-width:820px){body{padding-bottom:4.5rem;}.hero{margin-bottom:.9rem;}.layout{grid-template-columns:1fr;}.card{position:static;}.desktop-booking-card{display:none;}.mobile-top-actions{display:grid;gap:.7rem;margin:0 0 1.5rem;}.mobile-top-actions.apartment-actions{grid-template-columns:1fr 1fr;}.mobile-top-actions .btn{margin:0;padding:.78rem .55rem;font-size:.78rem;}.mobile-booking-card{display:block;}.mobile-whatsapp-fab{position:fixed;right:max(1rem,env(safe-area-inset-right));bottom:calc(1rem + env(safe-area-inset-bottom));z-index:900;display:flex;width:48px;height:48px;align-items:center;justify-content:center;border-radius:50%;background:#25d366;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.24);transition:transform .2s,box-shadow .2s;}.mobile-whatsapp-fab:hover{color:#fff;text-decoration:none;transform:translateY(-2px);box-shadow:0 9px 24px rgba(0,0,0,.28);}.mobile-whatsapp-fab:focus-visible{outline:3px solid #fff;outline-offset:3px;}.mobile-whatsapp-fab svg{width:25px;height:25px;fill:currentColor;}.nav-links{display:none;}.footer-inner{grid-template-columns:1fr;}.gallery{grid-template-columns:repeat(2,1fr);}}
`;

function head({ title, desc, canonical, ogImage, jsonld, ogType = 'website' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${SITE.metaPixel}');fbq('track','PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${SITE.metaPixel}&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.ga}"></script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${SITE.ga}');
document.addEventListener('click',function(e){var a=e.target.closest?e.target.closest('a[href]'):null;if(!a)return;var h=a.href||'',ev=null;if(/wa\\.me|api\\.whatsapp\\.com/i.test(h))ev='whatsapp_click';else if(/airbnb\\./i.test(h))ev='airbnb_click';else if(/booking\\.com/i.test(h))ev='booking_click';if(!ev)return;if(typeof gtag==='function')gtag('event',ev,{link_url:h,page_location:location.href,page_path:location.pathname});if(typeof fbq==='function')fbq('track','Lead',{content_category:ev.replace('_click','')});},true);
</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(SITE.brand)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs(ogImage)}">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${abs(ogImage)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#147481">
${FONTS}
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
<style>${BASE_CSS}</style>
</head>
<body>`;
}

function nav() {
  return `<nav class="nav"><div class="nav-inner">
<a href="/" class="nav-logo">Royal Nile <span>Villas</span></a>
<div class="nav-links"><a href="/#villas">Villas</a><a href="/#tours">Tours</a><a href="/restaurant.html">Restaurant</a><a href="/#location">Location</a><a href="${wa("Hi! I'd like to know more about Royal Nile Villas.")}" class="nav-cta" target="_blank" rel="noopener">Book Now</a></div>
</div></nav>`;
}

function footer() {
  const tourLinks = TOURS.map((t) => `<li><a href="/${t.primarySlug}">${esc(t.h1.replace(/ from Luxor| at Sunrise| \(East Bank\)/,''))}</a></li>`).join('');
  const villaLinks = VILLAS.slice(0, 6).map((v) => `<li><a href="/villas/${v.id}">${esc(v.name.replace('Royal Nile Villa — ','').replace('Royal Nile Villas — ','').replace('Royal Home Luxor — ',''))}</a></li>`).join('');
  return `<footer class="footer"><div class="footer-inner">
<div><h4>Royal Nile <span>Villas</span></h4><p>Premium Nile-view apartments, penthouses and curated tours on Luxor's West Bank. Superhost with 7+ years and 1,800+ reviews.</p></div>
<div><h5>Tours</h5><ul>${tourLinks}</ul></div>
<div><h5>Villas</h5><ul>${villaLinks}<li><a href="/restaurant.html">Rooftop Restaurant</a></li></ul></div>
</div><div class="footer-bottom">&copy; ${new Date().getFullYear()} Royal Nile Villas — West Bank, Luxor, Egypt. All rights reserved.</div></footer>
<div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-label="Photo viewer">
<button class="lightbox-close" id="lbClose" aria-label="Close">&#10005;</button>
<button class="lightbox-nav lightbox-prev" id="lbPrev" aria-label="Previous photo">&#8249;</button>
<img id="lbImg" alt="">
<button class="lightbox-nav lightbox-next" id="lbNext" aria-label="Next photo">&#8250;</button>
</div>
<script>
(function(){
  var imgs=[].slice.call(document.querySelectorAll('.gallery img'));
  if(!imgs.length)return;
  var lb=document.getElementById('lightbox'),lbImg=document.getElementById('lbImg'),i=0;
  function show(n){i=(n+imgs.length)%imgs.length;var s=imgs[i];lbImg.src=s.currentSrc||s.src;lbImg.alt=s.alt||'';}
  function open(n){show(n);lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
  function close(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');lbImg.src='';document.body.style.overflow='';}
  imgs.forEach(function(im,n){im.setAttribute('tabindex','0');im.setAttribute('role','button');
    im.addEventListener('click',function(){open(n);});
    im.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(n);}});});
  document.getElementById('lbClose').addEventListener('click',close);
  document.getElementById('lbPrev').addEventListener('click',function(e){e.stopPropagation();show(i-1);});
  document.getElementById('lbNext').addEventListener('click',function(e){e.stopPropagation();show(i+1);});
  lb.addEventListener('click',function(e){if(e.target===lb)close();});
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(i-1);else if(e.key==='ArrowRight')show(i+1);});
})();
</script>
</body></html>`;
}

function breadcrumbLd(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })) };
}
function faqLd(faqs) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
}
function providerLd() {
  return { '@type': 'TravelAgency', name: SITE.brand, url: ORIGIN + '/', telephone: '+' + SITE.whatsapp, address: { '@type': 'PostalAddress', addressLocality: SITE.addressLocality, addressRegion: SITE.addressRegion, addressCountry: SITE.addressCountry } };
}

function mobileWhatsappFab(href, label) {
  return `<a class="mobile-whatsapp-fab" href="${href}" target="_blank" rel="noopener" aria-label="${esc(label)}" title="${esc(label)}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.371-.011-.57-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 7.021 2.91 9.83 9.83 0 0 1 2.9 7.026c-.003 5.45-4.437 9.884-9.926 9.884m8.413-18.297A11.82 11.82 0 0 0 12.055 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.689 1.448h.005c6.557 0 11.893-5.335 11.896-11.893a11.82 11.82 0 0 0-3.488-8.413Z"/></svg></a>`;
}

// ---------------- TOUR PAGE ----------------
function tourPage(t) {
  const canonical = `${ORIGIN}/${t.primarySlug}`;
  const cover = t.coverImage || t.photos[0];
  const poster = img(cover);
  const galleryImgs = t.photos.slice(0, 6).map((p, i) => `<img src="${img(p)}" alt="${esc(t.photoAlts?.[i] || `${t.h1} — ${t.highlights[i] || 'Luxor tour photo ' + (i + 1)}`)}" loading="lazy">`).join('');
  const related = TOURS.filter((x) => x.id !== t.id).slice(0, 4).map((x) => `<a class="related-card" href="/${x.primarySlug}"><img src="${img(x.coverImage || x.photos[0])}" alt="${esc(x.h1)}" loading="lazy"><span>${esc(x.h1.replace(/ from Luxor| at Sunrise| \(East Bank\)/,''))}</span></a>`).join('');
  const ticketNote = t.ticketsExtra ? `<div class="note">Entrance tickets are extra and must be purchased by tourist credit card at each site's ticket office, as required by local law.</div>` : '';
  const galleryNote = t.galleryNote ? `<div class="note">${esc(t.galleryNote)}</div>` : '';
  const depositNote = t.depositNote ? `<div class="note">${esc(t.depositNote)}</div>` : '';
  const heroVideo = t.heroVideo ? `<video autoplay muted loop playsinline preload="none" poster="${poster}"><source src="${siteAsset(t.heroVideo)}" type="video/mp4"></video>` : '';
  const inquiryUrl = wa(t.depositNote ? `Hi! I'm interested in the ${t.h1} package. I understand that a non-refundable 25% deposit is required to hold the booking. Can you send availability, pricing, the remaining balance schedule and cancellation terms?` : `Hi! I'm interested in the ${t.h1} tour. Can you tell me more about availability and pricing?`);
  const bookingCard = `<div class="card"><h3>${esc(t.h1)}</h3><p class="rating">★ Hosted by a Luxor Superhost · 1,800+ reviews · 4.91 ★ rating</p>
<p style="font-size:.9rem;color:var(--text-secondary)">${esc(t.duration)} · ${esc(t.priceNote || 'private pickup from your villa or hotel')}.</p>
<a class="btn btn-3d btn-whatsapp" target="_blank" rel="noopener" href="${inquiryUrl}">Inquire on WhatsApp</a>
<a class="btn btn-outline" href="/#villas">Stay at our Nile-view villas</a></div>`;

  const tourLd = { '@context': 'https://schema.org', '@type': 'TouristTrip', name: t.h1, description: t.metaDesc, url: canonical, image: abs(poster), touristType: 'Sightseeing', provider: providerLd(), itinerary: { '@type': 'ItemList', itemListElement: t.highlights.map((h, i) => ({ '@type': 'ListItem', position: i + 1, name: h })) }, ...(t.depositNote ? { additionalProperty: [{ '@type': 'PropertyValue', name: 'Deposit', value: t.depositNote }] } : {}) };
  const crumbs = breadcrumbLd([{ name: 'Home', url: ORIGIN + '/' }, { name: 'Tours', url: ORIGIN + '/#tours' }, { name: t.h1, url: canonical }]);

  return head({ title: t.title, desc: t.metaDesc, canonical, ogImage: cover, jsonld: [tourLd, faqLd(t.faqs), crumbs], ogType: 'website' })
    + nav()
    + `<div class="wrap"><div class="crumbs"><a href="/">Home</a> › <a href="/#tours">Tours</a> › ${esc(t.h1)}</div>
<section class="hero" style="background-image:url('${poster}')">
${heroVideo}
<div class="hero-inner"><p class="eyebrow">Luxor Tours & Experiences</p><h1>${esc(t.h1)}</h1>
<div class="meta-row"><span class="pill">⏱ ${esc(t.duration)}</span><span class="pill">🚐 Hotel pickup</span><span class="pill">📍 Luxor, Egypt</span></div></div>
</section>
<div class="mobile-top-actions"><a class="btn btn-3d btn-whatsapp" target="_blank" rel="noopener" href="${inquiryUrl}">Inquire on WhatsApp</a></div>
<div class="layout"><div>
<p class="lede">${esc(t.overview)}</p>
<h2>Tour highlights</h2><ul class="checklist">${t.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
${ticketNote}${depositNote}
<div class="mobile-booking-card">${bookingCard}</div>
<h2>Photo gallery</h2><div class="gallery">${galleryImgs}</div>${galleryNote}
<h2>Frequently asked questions</h2>${t.faqs.map(([q, a]) => `<div class="faq"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('')}
</div>
<aside class="desktop-booking-card">${bookingCard}</aside>
</div>
<section class="related"><h2>Other Luxor experiences</h2><div class="related-grid">${related}</div></section>
</div>${mobileWhatsappFab(inquiryUrl, `Enquire about ${t.h1} on WhatsApp`)}`
    + footer();
}

// ---------------- VILLA PAGE ----------------
function villaPage(v) {
  const canonical = `${ORIGIN}/villas/${v.id}`;
  const cover = v.cover || v.photos[0];
  const poster = img(cover);
  const galleryImgs = v.photos.slice(0, 6).map((p, i) => `<img src="${img(p)}" alt="${esc(v.name)} — interior/exterior photo ${i + 1}" loading="lazy">`).join('');
  const related = VILLAS.filter((x) => x.id !== v.id).slice(0, 4).map((x) => `<a class="related-card" href="/villas/${x.id}"><img src="${img(x.cover || x.photos[0])}" alt="${esc(x.name)}" loading="lazy"><span>${esc(x.name.replace('Royal Nile Villa — ','').replace('Royal Nile Villas — ','').replace('Royal Home Luxor — ',''))}</span></a>`).join('');
  const title = `${v.name} | Luxor West Bank Villa with Pool`;
  const desc = `${v.description.slice(0, 150)}`.replace(/\s+\S*$/, '') + '… Book this ' + v.bedrooms + '-bedroom Luxor villa.';
  const inquiryUrl = wa(`Hi! I'm interested in booking the ${v.name}. Is it available?`);
  const bookingCard = `<div class="card"><h3>${esc(v.name)}</h3><p class="rating">★ ${v.rating} · ${v.reviews} reviews · ${esc(v.floor)}</p>
<p style="font-size:.9rem;color:var(--text-secondary)">${esc(v.bedsConfig)} · sleeps ${v.guests} · ${esc(v.viewType)}.</p>
<a class="btn btn-3d btn-whatsapp" target="_blank" rel="noopener" href="${inquiryUrl}">Book direct on WhatsApp</a>
<a class="btn btn-3d btn-airbnb" target="_blank" rel="noopener" href="${v.airbnbUrl}">Reserve on Airbnb</a>
<a class="btn btn-3d btn-booking" target="_blank" rel="noopener" href="${v.bookingUrl}">Reserve on Booking.com</a></div>`;

  const productLd = { '@context': 'https://schema.org', '@type': 'Product', name: v.name, description: v.description, image: abs(poster), brand: { '@type': 'Brand', name: SITE.brand }, url: canonical, aggregateRating: { '@type': 'AggregateRating', ratingValue: String(v.rating), reviewCount: v.reviews, bestRating: '5' } };
  const lodgingLd = { '@context': 'https://schema.org', '@type': 'Accommodation', name: v.name, description: v.description, url: canonical, numberOfBedrooms: v.bedrooms, numberOfBathroomsTotal: v.bathrooms, occupancy: { '@type': 'QuantitativeValue', maxValue: v.guests }, amenityFeature: v.features.map((f) => ({ '@type': 'LocationFeatureSpecification', name: f })), address: { '@type': 'PostalAddress', addressLocality: SITE.addressLocality, addressRegion: SITE.addressRegion, addressCountry: SITE.addressCountry }, geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng } };
  const crumbs = breadcrumbLd([{ name: 'Home', url: ORIGIN + '/' }, { name: 'Villas', url: ORIGIN + '/#villas' }, { name: v.name, url: canonical }]);
  const faqs = [
    ['How far is the villa from the Valley of the Kings?', 'The villa is on Luxor’s West Bank in Al Aqaletah — about 15 minutes from the Valley of the Kings, 10 minutes from the balloon launch site and 5 minutes from the West Bank ferry, with a free shuttle to the ferry.'],
    ['Is airport pickup available?', 'Yes. Airport pickup and drop-off can be arranged, along with private tours and a free shuttle to the West Bank ferry.'],
    ['How do I book?', 'Message us directly on WhatsApp for the best direct rates and availability, or book instantly via our Airbnb and Booking.com listings.'],
  ];

  return head({ title, desc, canonical, ogImage: cover, jsonld: [productLd, lodgingLd, faqLd(faqs), crumbs], ogType: 'website' })
    + nav()
    + `<div class="wrap"><div class="crumbs"><a href="/">Home</a> › <a href="/#villas">Villas</a> › ${esc(v.name)}</div>
<section class="hero" style="background-image:url('${poster}')"><div class="hero-inner"><p class="eyebrow">Luxor West Bank · ${esc(v.viewType)}</p><h1>${esc(v.name)}</h1>
<div class="meta-row"><span class="pill">★ ${v.rating} · ${v.reviews} reviews</span><span class="pill">🛏 ${v.bedrooms} bedrooms</span><span class="pill">🚿 ${v.bathrooms} bath</span><span class="pill">👥 up to ${v.guests} guests</span></div></div></section>
<div class="mobile-top-actions apartment-actions">
<a class="btn btn-3d btn-airbnb" target="_blank" rel="noopener" href="${v.airbnbUrl}">Reserve on Airbnb</a>
<a class="btn btn-3d btn-booking" target="_blank" rel="noopener" href="${v.bookingUrl}">Reserve on Booking.com</a>
</div>
<div class="layout"><div>
<p class="lede">${esc(v.description)}</p>
<h2>What this villa offers</h2><ul class="checklist">${v.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
<div class="note">Located in Al Aqaletah on Luxor’s tranquil West Bank — 15 min to the Valley of the Kings, 10 min to the balloon launch, 5 min to the ferry. Free shuttle to the West Bank ferry, on-site 14-metre pool and Nile-view rooftop restaurant.</div>
<div class="mobile-booking-card">${bookingCard}</div>
<h2>Photo gallery</h2><div class="gallery">${galleryImgs}</div>
<h2>Frequently asked questions</h2>${faqs.map(([q, a]) => `<div class="faq"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('')}
</div>
<aside class="desktop-booking-card">${bookingCard}</aside>
</div>
<section class="related"><h2>More Royal Nile villas</h2><div class="related-grid">${related}</div></section>
</div>${mobileWhatsappFab(inquiryUrl, `Enquire about ${v.name} on WhatsApp`)}`
    + footer();
}

// ---------------- WRITE FILES ----------------
let written = [];
function write(rel, content) { const fp = path.join(ROOT, rel); fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, content); written.push(rel); }

TOURS.forEach((t) => write(`${t.primarySlug}.html`, tourPage(t)));
VILLAS.forEach((v) => write(`villas/${v.id}.html`, villaPage(v)));

// ---------------- SITEMAP ----------------
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: ORIGIN + '/', pri: '1.0', freq: 'weekly' },
  { loc: ORIGIN + '/restaurant.html', pri: '0.8', freq: 'monthly' },
  ...TOURS.map((t) => ({ loc: `${ORIGIN}/${t.primarySlug}`, pri: '0.9', freq: 'monthly' })),
  ...VILLAS.map((v) => ({ loc: `${ORIGIN}/villas/${v.id}`, pri: '0.9', freq: 'weekly' })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.pri}</priority></url>`).join('\n') +
  `\n</urlset>\n`;
write('sitemap.xml', sitemap);

// ---------------- VERCEL REWRITES BLOCK (for reference / paste) ----------------
const rw = [];
TOURS.forEach((t) => {
  const dest = `/${t.primarySlug}.html`;
  [t.primarySlug, ...t.aliases].forEach((s) => { rw.push({ source: `/${s}`, destination: dest }); rw.push({ source: `/${s}/`, destination: dest }); });
});
VILLAS.forEach((v) => { rw.push({ source: `/villas/${v.id}`, destination: `/villas/${v.id}.html` }); rw.push({ source: `/villas/${v.id}/`, destination: `/villas/${v.id}.html` }); });
write('seo-build/_rewrites.generated.json', JSON.stringify(rw, null, 2));

console.log('Generated ' + written.length + ' files:');
written.forEach((w) => console.log('  ' + w));
console.log('\nSitemap URLs: ' + urls.length);
