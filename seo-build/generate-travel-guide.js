/* Build the Egypt Travel Guide hub and individual long-tail article pages. */
const fs = require('fs');
const path = require('path');
const { ARTICLES } = require('./travel-guide-data.js');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'https://egyptvillastours.com';
const GUIDE_ROOT = path.join(ROOT, 'egypt-travel-guide');
const DEFAULT_ARTICLE_DATE = '2026-08-07';
const GUIDE_UPDATED = '2026-08-29';
const WHATSAPP = 'https://wa.me/201204421652';
const ECLIPSE_GUIDE_ORDER = [
  'luxor-total-solar-eclipse-2027',
  'luxor-eclipse-2027-tour-itinerary',
  'where-to-stay-luxor-solar-eclipse-2027',
];
const ORDERED_ARTICLES = [
  ...ECLIPSE_GUIDE_ORDER.flatMap((slug) => ARTICLES.filter((article) => article.slug === slug)),
  ...ARTICLES.filter((article) => !ECLIPSE_GUIDE_ORDER.includes(article.slug)),
];
const HUB_ITEMS = ORDERED_ARTICLES.map((article) => ({ ...article, href: `/egypt-travel-guide/${article.slug}/` }));

const esc = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const absolute = (value) => /^https?:\/\//.test(value) ? value : `${ORIGIN}${value.startsWith('/') ? value : `/${value}`}`;

const CSS = `
:root{--bg:#fcfbf7;--bg-warm:#f4f0e7;--card:#fff;--primary:#147481;--primary-light:#2d9aa7;--primary-dark:#0d5862;--primary-glow:rgba(20,116,129,.14);--gold:#c8a45d;--text:#1f2a2c;--text-secondary:#5d6969;--text-muted:#8d9895;--border:#e7e0d1;--border-light:#f0eadf;--shadow:0 4px 20px rgba(0,0,0,.06);--shadow-lg:0 12px 40px rgba(0,0,0,.1);--display:'Playfair Display',Georgia,serif;--body:'Inter',-apple-system,BlinkMacSystemFont,sans-serif}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:var(--body);line-height:1.75;-webkit-font-smoothing:antialiased}a{color:inherit;text-decoration:none}img{display:block;max-width:100%}.nav{position:sticky;top:0;z-index:50;border-bottom:1px solid var(--border);background:rgba(254,253,251,.95);backdrop-filter:blur(16px);box-shadow:0 1px 3px rgba(0,0,0,.04)}.nav-inner{max-width:1300px;margin:auto;padding:14px 22px;display:flex;align-items:center;justify-content:space-between;gap:24px}.logo{font-family:var(--display);font-size:24px;font-weight:700;letter-spacing:.02em}.logo span{color:var(--primary)}.nav-links{display:flex;align-items:center;gap:24px;font:600 11px/1 var(--body);letter-spacing:.11em;text-transform:uppercase;color:var(--text-secondary)}.nav-links a:hover,.nav-links a[aria-current=page]{color:var(--primary)}.book{border-radius:999px;padding:12px 18px;background:var(--primary);color:#fff!important}.book:hover{background:var(--primary-dark)}.wrap{max-width:1180px;margin:auto;padding:58px 22px 92px}.breadcrumb{font:500 11px/1.6 var(--body);color:var(--text-muted);margin-bottom:34px}.breadcrumb a:hover{color:var(--primary)}.kicker{display:block;color:var(--primary);font:700 10px/1.4 var(--body);letter-spacing:.32em;text-transform:uppercase;margin-bottom:15px}h1,h2,h3,p{margin-top:0}h1,h2,h3{font-family:var(--display);color:var(--text)}h1{max-width:980px;font-size:clamp(40px,6vw,72px);font-weight:700;line-height:1.08;letter-spacing:-.02em;margin-bottom:24px}h2{font-size:clamp(25px,3vw,36px);font-weight:600;line-height:1.22;margin-bottom:14px}.dek{max-width:800px;color:var(--text-secondary);font-family:var(--display);font-size:clamp(18px,2.2vw,24px);font-style:italic;line-height:1.58}.meta{font:600 10px/1.5 var(--body);letter-spacing:.16em;text-transform:uppercase;color:var(--text-muted);margin-top:24px}.hero{margin:42px 0 58px;aspect-ratio:16/9;border:1px solid var(--border);border-radius:28px;overflow:hidden;background:var(--bg-warm);box-shadow:var(--shadow-lg)}.hero img{width:100%;height:100%;object-fit:cover}.grid{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:66px;align-items:start}.article-body{max-width:780px}.article-section{padding:0 0 34px;margin-bottom:34px;border-bottom:1px solid var(--border-light)}.article-section p{color:var(--text-secondary);font:400 16px/1.95 var(--body);margin:0}.aside{position:sticky;top:92px;display:grid;gap:20px}.aside-card{border:1px solid var(--border);border-radius:20px;background:var(--card);padding:24px;box-shadow:var(--shadow)}.aside-card h2{font-size:23px}.tips{list-style:none;margin:0;padding:0;display:grid;gap:12px}.tips li{position:relative;padding-left:22px;color:var(--text-secondary);font:400 13px/1.65 var(--body)}.tips li:before{content:'✓';position:absolute;left:0;color:var(--primary);font-weight:800}.cta{background:linear-gradient(145deg,var(--primary),var(--primary-dark));border-color:transparent}.cta h2{color:#fff}.cta .kicker{color:#d7edea}.cta p{color:rgba(255,255,255,.84);font:400 13px/1.7 var(--body)}.btn{display:inline-flex;margin-top:12px;align-items:center;border-radius:999px;background:#fff;color:var(--primary-dark);padding:13px 18px;font:800 10px/1 var(--body);letter-spacing:.13em;text-transform:uppercase;box-shadow:0 5px 18px rgba(0,0,0,.12)}.btn:hover{background:var(--bg-warm)}.sources{margin-top:38px;padding-top:30px;border-top:1px solid var(--border)}.sources ul{padding-left:18px}.sources li{margin:9px 0;color:var(--text-secondary);font:400 13px/1.6 var(--body)}.sources a{color:var(--primary);text-decoration:underline;text-underline-offset:4px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:45px}.card{overflow:hidden;border:1px solid var(--border);border-radius:20px;background:var(--card);box-shadow:var(--shadow);transition:.25s}.card:hover{transform:translateY(-4px);border-color:rgba(20,116,129,.35);box-shadow:var(--shadow-lg)}.card img{width:100%;aspect-ratio:16/10;object-fit:cover}.card-content{padding:22px}.card h2{font-size:24px}.card p{color:var(--text-secondary);font:400 13px/1.75 var(--body)}.read{display:inline-block;color:var(--primary);font:700 10px/1 var(--body);letter-spacing:.17em;text-transform:uppercase;margin-top:10px}.featured{grid-column:span 2}.featured h2{font-size:32px}.back{display:inline-block;margin-top:48px;color:var(--primary);font:700 10px/1 var(--body);letter-spacing:.17em;text-transform:uppercase}.footer{border-top:1px solid var(--border);background:var(--bg-warm)}.footer-inner{max-width:1180px;margin:auto;padding:44px 22px;display:flex;justify-content:space-between;gap:30px;color:var(--text-muted);font:400 11px/1.7 var(--body)}.footer a{color:var(--text-secondary)}.footer a:hover{color:var(--primary)}
.hero-caption{margin:-42px 8px 50px;color:var(--text-muted);font:400 11px/1.6 var(--body)}
.article-image{margin:2px 0 42px}.article-image img{width:100%;aspect-ratio:16/9;object-fit:cover;border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow)}.article-image figcaption{margin:10px 7px 0;color:var(--text-muted);font:400 11px/1.6 var(--body)}
@media(max-width:900px){.nav-inner{align-items:flex-start}.nav-links{justify-content:flex-end;flex-wrap:wrap;gap:13px 16px}.grid{grid-template-columns:1fr;gap:36px}.aside{position:static;grid-template-columns:1fr 1fr}.cards{grid-template-columns:1fr 1fr}.featured{grid-column:span 2}}
@media(max-width:620px){.nav-inner{display:block}.logo{display:block;margin-bottom:14px}.nav-links{justify-content:flex-start}.wrap{padding-top:38px}.hero{margin:30px 0 40px;border-radius:17px}.aside{grid-template-columns:1fr}.cards{grid-template-columns:1fr}.featured{grid-column:auto}.featured h2{font-size:24px}.footer-inner{display:block}.footer-inner div+div{margin-top:12px}}
`;

const nav = (current = 'guide') => `<nav class="nav"><div class="nav-inner">
  <a class="logo" href="/">Royal Nile <span>Villas</span></a>
  <div class="nav-links"><a href="/#villas">Villas</a><a href="/#tours">Tours</a><a href="/restaurant.html">Restaurant</a><a href="/egypt-travel-guide/"${current === 'guide' ? ' aria-current="page"' : ''}>Egypt Travel Guide</a><a class="book" href="${WHATSAPP}" target="_blank" rel="noopener">Book Now</a></div>
</div></nav>`;

const footer = `<footer class="footer"><div class="footer-inner"><div>Royal Nile Villas · Premium West Bank apartments, local transfers and private tours.</div><div><a href="/">Villas & Tours</a> · <a href="/egypt-travel-guide/">Egypt Travel Guide</a> · <a href="https://share.google/P6PPmkbxRYg6QhLie" target="_blank" rel="noopener">Royal Nile Villas on Google</a> · <a href="https://share.google/xxd26OMK5AOtsgYik" target="_blank" rel="noopener">Royal Home Villa on Google</a></div></div></footer>`;

const head = ({ title, description, canonical, image, type = 'article', schema }) => `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="${type}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${absolute(image)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${absolute(image)}">
<meta name="theme-color" content="#147481"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap" rel="stylesheet">
<style>${CSS}</style><script type="application/ld+json">${JSON.stringify(schema)}</script></head>`;

const articleCard = (article, index) => `<a class="card${index === 0 ? ' featured' : ''}" href="${article.href}"><img src="${article.image}" alt="" loading="${index < 3 ? 'eager' : 'lazy'}"><div class="card-content"><span class="kicker">${esc(article.readTime)}</span><h2>${esc(article.title)}</h2><p>${esc(article.dek)}</p><span class="read">Read article →</span></div></a>`;

const buildHub = () => {
  const canonical = `${ORIGIN}/egypt-travel-guide/`;
  const schema = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Egypt Travel Guide', description: 'Practical Luxor accommodation and travel advice from Royal Nile Villas.', url: canonical },
    { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: HUB_ITEMS.map((article, index) => ({ '@type': 'ListItem', position: index + 1, name: article.title, url: absolute(article.href) })) },
  ];
  return `${head({ title: 'Egypt Travel Guide | Luxor West Bank Stays & Local Advice', description: 'Practical guides to Luxor West Bank accommodation, apartments, family stays, the Valley of the Kings and the 2027 total solar eclipse.', canonical, image: HUB_ITEMS[0].image, type: 'website', schema })}<body>${nav()}<main class="wrap"><nav class="breadcrumb"><a href="/">Home</a> › Egypt Travel Guide</nav><span class="kicker">Royal Nile Villas · Local Field Notes</span><h1>Egypt Travel Guide</h1><p class="dek">Clear, practical advice for choosing where to stay in Luxor, moving between the two banks and planning the experiences that begin on our doorstep.</p><div class="cards">${HUB_ITEMS.map(articleCard).join('')}</div></main>${footer}</body></html>`;
};

const buildArticle = (article) => {
  const canonical = `${ORIGIN}/egypt-travel-guide/${article.slug}/`;
  const published = article.datePublished || DEFAULT_ARTICLE_DATE;
  const modified = article.dateModified || published;
  const schema = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.description, image: absolute(article.image), datePublished: published, dateModified: modified, author: { '@type': 'Organization', name: 'Royal Nile Villas' }, publisher: { '@type': 'Organization', name: 'Royal Nile Villas', url: ORIGIN }, mainEntityOfPage: canonical },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Egypt Travel Guide', item: `${ORIGIN}/egypt-travel-guide/` },
      { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
    ] },
  ];
  const sections = article.sections.map((section, index) => {
    const inlineImages = (article.inlineImages || []).filter((image) => image.afterSection === index + 1).map((image) => `<figure class="article-image"><img src="${esc(image.src)}" alt="${esc(image.alt)}" loading="lazy"><figcaption>${esc(image.caption)}</figcaption></figure>`).join('');
    return `<section class="article-section"><h2>${esc(section.heading)}</h2><p>${esc(section.body)}</p></section>${inlineImages}`;
  }).join('');
  const relatedLinks = article.relatedLinks?.length ? `<section class="sources"><h2>Plan the rest of your Luxor eclipse trip</h2><ul>${article.relatedLinks.map((link) => `<li><a href="${esc(link.url)}">${esc(link.label)}</a></li>`).join('')}</ul></section>` : '';
  const sources = article.sources?.length ? `<section class="sources"><h2>Sources and further reading</h2><ul>${article.sources.map((source) => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.label)}</a></li>`).join('')}</ul></section>` : '';
  const caption = article.imageCaption ? `<p class="hero-caption">${esc(article.imageCaption)}</p>` : '';
  const whatsappMessage = article.whatsappMessage || `Hi! I read “${article.title}” and would like help choosing a Royal Nile Villas apartment.`;
  return `${head({ title: `${article.seoTitle || article.title} | Royal Nile Villas`, description: article.description, canonical, image: article.image, schema })}<body>${nav()}<main class="wrap"><nav class="breadcrumb"><a href="/">Home</a> › <a href="/egypt-travel-guide/">Egypt Travel Guide</a> › ${esc(article.title)}</nav><header><span class="kicker">Egypt Travel Guide · ${esc(article.readTime)}</span><h1>${esc(article.title)}</h1><p class="dek">${esc(article.dek)}</p><p class="meta">Published ${published} · Updated ${modified}</p></header><figure class="hero"><img src="${article.image}" alt="${esc(article.title)}"></figure>${caption}<div class="grid"><div class="article-body">${sections}${relatedLinks}${sources}<a class="back" href="/egypt-travel-guide/">← All guide articles</a></div><aside class="aside"><section class="aside-card"><span class="kicker">Booking checklist</span><ul class="tips">${article.tips.map((tip) => `<li>${esc(tip)}</li>`).join('')}</ul></section><section class="aside-card cta"><h2>${esc(article.ctaTitle)}</h2><p>${esc(article.ctaBody)}</p><a class="btn" href="${WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}" target="_blank" rel="noopener">Check availability →</a></section></aside></div></main>${footer}</body></html>`;
};

fs.mkdirSync(GUIDE_ROOT, { recursive: true });
fs.writeFileSync(path.join(GUIDE_ROOT, 'index.html'), buildHub());
for (const article of ARTICLES) {
  const dir = path.join(GUIDE_ROOT, article.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildArticle(article));
}

const sitemapPath = path.join(ROOT, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
sitemap = sitemap.replace(/\n\s*<url><loc>https:\/\/egyptvillastours\.com\/egypt-travel-guide\/.*?<\/url>/gs, '');
const entries = [
  `<url><loc>${ORIGIN}/egypt-travel-guide/</loc><lastmod>${GUIDE_UPDATED}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
  ...ARTICLES.map((article) => `<url><loc>${ORIGIN}/egypt-travel-guide/${article.slug}/</loc><lastmod>${article.dateModified || DEFAULT_ARTICLE_DATE}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`),
].map((entry) => `  ${entry}`).join('\n');
sitemap = sitemap.replace('</urlset>', `${entries}\n</urlset>`);
fs.writeFileSync(sitemapPath, sitemap);

console.log(`Generated Egypt Travel Guide hub + ${ARTICLES.length} articles.`);
