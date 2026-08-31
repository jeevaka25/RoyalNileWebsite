// Collection pages reuse the same inventory and shared chrome as detail pages.
const { SITE, VILLAS, TOURS, wa, optimizedImage } = require('./data');
const { HOST_TRUST } = require('./seo-content');
const { searchBar, searchResults } = require('./booking-ui');
const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shortName = (villa) => villa.name.replace(/Royal Nile Villas? — /, '').replace('Royal Home Luxor — ', 'Royal Home ');
const VILLA_ORDER = ['sky-penthouse-1', 'sky-penthouse-2', 'nile-view-luxury-1', 'nile-view-luxury-2', 'nile-view-1', 'nile-view-2', 'royal-home-nile-view', 'royal-home-pool-view'];
const VILLA_NOTES = {
  'royal-home-nile-view': 'A top-floor Royal Home retreat with a private balcony looking over the pool, countryside and Nile.',
  'royal-home-pool-view': 'Step out towards the pool, then slow down in the rose garden. A ground-floor Royal Home apartment with its own entrance.',
  'sky-penthouse-1': 'A private terrace above the West Bank, with panoramic Nile and desert views and space to settle into a slower rhythm.',
  'sky-penthouse-2': 'Panoramic views, a private terrace and a dedicated workspace: a penthouse for lingering a little longer.',
  'nile-view-luxury-1': 'Two queen bedrooms and two bathrooms make this second-floor apartment a practical choice for two couples.',
  'nile-view-luxury-2': 'A second-floor apartment with two queen bedrooms and a private terrace overlooking the Nile, pool and garden.',
  'nile-view-1': 'Ground-floor living with direct pool access, one queen bed and two singles, plus garden and mountain views.',
  'nile-view-2': 'A ground-floor base with direct pool access, a queen-and-twin layout, and views towards the Nile and desert.',
};
const TOUR_NOTES = {
  balloon: ['Sunrise balloon flight', 'A shared flight above Luxor’s West Bank, with hotel transfers and a flight certificate. Flight operation and timing depend on conditions.', 'Hotel pickup & drop-off · Shared flight'],
  'west-bank': ['Valley of the Kings & West Bank', 'Explore the royal tombs, Hatshepsut Temple and Colossi of Memnon with a private Egyptologist guide.', 'Private guide & transfers · Tickets extra'],
  'east-bank': ['Karnak & Luxor Temple', 'Spend a relaxed half-day among the monumental columns and temple courts of Luxor’s East Bank.', 'Private guide & transfers · Tickets extra'],
  desert: ['Desert quad bike safari', 'Head into the Western Desert for a guided quad ride, a tea stop and an afternoon that stretches towards sunset.', 'Hotel transfers · Helmet & safety briefing'],
  'nile-boat-cruise': ['Sunset Nile boat cruise', 'Trade sightseeing for a quiet evening on the river, with an Egyptian dinner and private round-trip transfers.', 'Private cruise · Dinner & transfers'],
  'abydos-dendera': ['Abydos & Dendera temples', 'Travel north to Seti I’s temple at Abydos and the painted ceilings of Dendera. Leave a full day for the journey.', 'Private vehicle & driver · Guide optional'],
  aswan: ['Aswan & Philae Temple', 'Journey south via Edfu to the Aswan High Dam and the island Temple of Philae.', 'Private vehicle & driver · Guide optional'],
  'abu-simbel': ['Abu Simbel from Luxor', 'An ambitious day south to the temples of Ramesses II and Nefertari. Expect an early departure and long drives in both directions.', 'Private vehicle & driver · Guide optional'],
  'red-sea': ['Red Sea snorkelling', 'Travel from Luxor to Hurghada for a boat trip and snorkelling among the Red Sea’s coral reefs.', 'Private road transfers · Boat trip'],
};
const GROUPS = [
  { id: 'local-experiences', name: 'Stay close. Discover more.', label: '01 / In & around Luxor', intro: 'Build your days around a sunrise flight, a guided temple visit or an unhurried evening on the Nile.', ids: ['balloon', 'west-bank', 'east-bank', 'nile-boat-cruise', 'desert'] },
  { id: 'day-trips', name: 'A little further along the journey.', label: '02 / Full-day escapes', intro: 'Set aside a full day for these longer journeys from Luxor. Confirm departure times, travel time and guide options before booking.', ids: ['abydos-dendera', 'aswan', 'abu-simbel', 'red-sea'] },
];
const STAR = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.9 6.9-1Z"/></svg>';

function villaCard(v, index) {
  const url = `/villas/${v.id}`;
  return `<article class="inventory-card" id="${v.id}">
<a class="inventory-image" href="${url}" tabindex="-1" aria-hidden="true"><img src="${optimizedImage(v.cover || v.photos[0])}" alt="" width="800" height="560" loading="lazy"><span class="image-label">${esc(v.floor)}</span><span class="collection-number">${String(index + 1).padStart(2, '0')}</span></a>
<div class="inventory-content"><p class="inventory-location">${v.id.startsWith('royal-home') ? 'Royal Home Villa' : 'Royal Nile Villas'} · Luxor West Bank</p><h3><a href="${url}">${esc(shortName(v))}</a></h3><p>${VILLA_NOTES[v.id]}</p>
<dl class="inventory-specs"><div><dt>Bedrooms</dt><dd>${v.bedrooms}</dd></div><div><dt>Guests</dt><dd>Up to ${v.guests}</dd></div><div><dt>Bathrooms</dt><dd>${v.bathrooms}</dd></div></dl>
<div class="inventory-details"><span>${esc(v.bedsConfig)}</span><span>${esc(v.viewType.replace(/\s+views?$/i, ''))} views</span><span>${v.features.includes('Direct Pool Access') ? 'Direct access to shared pool' : 'Shared pool access'}</span></div>
<div class="inventory-actions villa-booking-actions"><a class="collection-button" href="${url}">Explore apartment <span aria-hidden="true">↗</span></a><a class="collection-button airbnb-button" href="${v.airbnbUrl}" target="_blank" rel="noopener">Book on Airbnb <span aria-hidden="true">↗</span></a><a class="text-link" href="${wa(`Hi! I'd like to check availability for ${v.name}.`)}" target="_blank" rel="noopener" aria-label="WhatsApp us about ${esc(shortName(v))}">WhatsApp us</a></div></div></article>`;
}

function tourCard(t) {
  const [name, summary, inclusions] = TOUR_NOTES[t.id];
  const url = `/${t.primarySlug}`;
  return `<article class="inventory-card"><a class="inventory-image" href="${url}" tabindex="-1" aria-hidden="true"><img src="${optimizedImage(t.coverImage || t.photos[0])}" alt="" width="800" height="560" loading="lazy"><span class="image-label">${esc(t.duration)}</span></a>
<div class="inventory-content"><p class="inventory-location">${['balloon', 'west-bank', 'east-bank', 'desert', 'nile-boat-cruise'].includes(t.id) ? 'In & around Luxor' : 'Day trip from Luxor'}</p><h3><a href="${url}">${esc(name)}</a></h3><p>${esc(summary)}</p><p class="tour-inclusions">${esc(inclusions)}</p><div class="inventory-actions"><a class="collection-button" href="${url}">Explore experience <span aria-hidden="true">↗</span></a><a class="text-link" href="${wa(`Hi! I'd like to ask about ${t.h1}.`)}" target="_blank" rel="noopener" aria-label="Ask about ${esc(name)} on WhatsApp">Ask about dates</a></div></div></article>`;
}

function villaCollection() {
  return `<section class="collection-section" id="collection"><div class="section-intro"><div><p class="collection-kicker">The full collection</p><h2>Find your place by the Nile.</h2></div><p>Eight individual two-bedroom apartments and penthouses across Royal Nile Villas and Royal Home. Each sleeps up to four guests; compare the floor, bed layout and outlook below.</p></div>
<p class="collection-note">These are individual apartment bookings. For entire villa bookings, <a href="${wa("Hi! I'd like to arrange an entire villa booking. Please help design our stay.")}" target="_blank" rel="noopener">WhatsApp us</a> and we’ll design your stay for you. Pools are shared.</p>
${searchResults()}<div class="inventory-grid">${VILLA_ORDER.map((id, index) => villaCard(VILLAS.find(v => v.id === id), index)).join('')}</div></section>
<section class="collection-section choice-section" aria-labelledby="choose-heading"><p class="collection-kicker">Make yourself at home</p><h2 id="choose-heading">A few details make all the difference.</h2><div class="advice-grid">
<article><span>01</span><h3>Choose your floor</h3><p>Ground-floor apartments offer direct pool access. The penthouses offer private terraces and panoramic views. If stairs or step-free access matter, confirm the exact route with us before booking.</p></article>
<article><span>02</span><h3>Choose your layout</h3><p>Travelling with friends? Luxury Nile View 1 has two queen bedrooms and two bathrooms. For a queen-and-twin setup, compare the penthouses, Nile View apartments or Royal Home Pool View.</p></article>
<article><span>03</span><h3>Build the rest of your stay</h3><p>Pair your apartment with <a href="/tours/">Luxor tours and day trips</a>, arrange airport transfers, and leave time for a meal at our <a href="/restaurant.html">Nile-view restaurant</a>.</p></article></div>
<div class="reading-links"><a href="/egypt-travel-guide/luxor-apartment-vs-hotel/">Apartment or hotel in Luxor? ↗</a><a href="/egypt-travel-guide/where-to-stay-luxor-with-family/">Planning a family stay ↗</a></div></section>`;
}

function tourCollection() {
  const eclipse = TOURS.find(t => t.id === 'eclipse-2027');
  return `<nav class="collection-jumps" aria-label="Tour categories"><a href="#local-experiences">Luxor experiences <span>05</span></a><a href="#day-trips">Full-day escapes <span>04</span></a><a href="#eclipse-stay">Eclipse 2027 stay <span>01</span></a></nav>
${GROUPS.map(group => `<section class="collection-section" id="${group.id}"><div class="section-intro"><div><p class="collection-kicker">${group.label}</p><h2>${group.name}</h2></div><p>${group.intro}</p></div><div class="inventory-grid">${group.ids.map(id => tourCard(TOURS.find(t => t.id === id))).join('')}</div></section>`).join('')}
<section class="eclipse-feature" id="eclipse-stay"><img src="${SITE.ogImage}" width="900" height="700" loading="lazy" alt="Royal Nile Villas pool and gardens beside the Nile"><div><p class="collection-kicker">03 / A stay built around the occasion</p><h2>Solar Eclipse 2027.<br>A Nile-side base.</h2><p>Our Luxor eclipse accommodation package starts with a minimum four-night stay, full board and private Luxor Airport transfers. Build optional tours around your stay.</p><p class="collection-note">A 25% non-refundable deposit is required to hold the booking. Ask for a written quotation, availability and the remaining payment terms.</p><a class="collection-button" href="/${eclipse.primarySlug}">Explore the eclipse stay <span aria-hidden="true">↗</span></a></div></section>
<section class="collection-section choice-section" aria-labelledby="tour-planning"><p class="collection-kicker">Before you book</p><h2 id="tour-planning">Less guesswork. More time exploring.</h2><div class="advice-grid">
<article><span>01</span><h3>Check what is included</h3><p>Private does not always mean a guide is included. Our West and East Bank tours include an Egyptologist; several longer trips offer a guide as an extra. Check entrance tickets and other exclusions on each tour page.</p></article>
<article><span>02</span><h3>Leave room in your day</h3><p>A flight duration is not the full outing time. Airport, hotel and boat transfers add time, and Abu Simbel involves a particularly long drive. Confirm the pickup location and schedule for your dates.</p></article>
<article><span>03</span><h3>Keep your stay connected</h3><p>Choose a <a href="/villas/">West Bank apartment</a> as your base, then ask us to coordinate your experiences and transfers. Share your dates and priorities so we can suggest a workable sequence.</p></article></div><div class="reading-links"><a href="/egypt-travel-guide/where-to-stay-near-valley-of-the-kings/">Staying near the Valley of the Kings ↗</a><a href="/egypt-travel-guide/luxor-eclipse-2027-tour-itinerary/">Planning an eclipse itinerary ↗</a></div></section>`;
}

function collectionPage(kind, { head, nav, footer }) {
  const villas = kind === 'villas';
  const canonical = `${SITE.origin}/${kind}/`;
  const title = villas ? 'Luxor Apartments & Villas: Compare Our 8 Stays | Royal Nile' : 'Luxor Tours & Upper Egypt Day Trips | Royal Nile Villas';
  const description = villas ? 'Compare eight Nile-view apartments and penthouses in Luxor. Explore bedrooms, pool access, terraces and layouts, then check dates with Royal Nile Villas.' : 'Explore Luxor tours, sunrise balloons, Nile cruises and day trips to Dendera, Aswan and Abu Simbel. Compare durations and plan your Upper Egypt stay.';
  const hero = villas ? optimizedImage(VILLAS.find(v => v.id === 'nile-view-luxury-1').cover) : optimizedImage(TOURS.find(t => t.id === 'balloon').coverImage || TOURS.find(t => t.id === 'balloon').photos[0]);
  const items = villas ? VILLA_ORDER.map(id => { const v = VILLAS.find(v => v.id === id); return { name: shortName(v), url: `${SITE.origin}/villas/${v.id}` }; }) : [...GROUPS.flatMap(g => g.ids), 'eclipse-2027'].map(id => { const t = TOURS.find(t => t.id === id); return { name: t.h1, url: `${SITE.origin}/${t.primarySlug}` }; });
  const list = { '@type': 'ItemList', '@id': `${canonical}#list`, numberOfItems: items.length, itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, ...item })) };
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': canonical, name: title.split(' | ')[0], description, url: canonical, image: SITE.origin + hero, mainEntity: list },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE.origin + '/' }, { '@type': 'ListItem', position: 2, name: villas ? 'Villas & apartments' : 'Tours', item: canonical }] },
  ];
  return head({ title, desc: description, canonical, ogImage: hero, jsonld, stylesheet: '/collection-pages.css', bodyClass: villas ? 'collection-page has-availability-search' : 'collection-page' }).replace('</head>', '<link rel="stylesheet" href="/booking-ui.css"></head>') + `<a class="skip-link" href="#main">Skip to content</a>` + nav(kind) + (villas ? searchBar() : '') + `<main id="main" class="collection-wrap"><nav class="collection-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>${villas ? 'Villas & apartments' : 'Tours & experiences'}</span></nav>
<header class="collection-hero"><div class="collection-hero-copy"><p class="collection-kicker">${villas ? 'Royal Nile Villas & Royal Home · Luxor' : 'Your Upper Egypt journey starts here'}</p><h1>${villas ? 'Nile-view apartments<br>& villas in <em>Luxor.</em>' : 'Luxor tours.<br><em>Extraordinary</em><br>days in Egypt.'}</h1><p>${villas ? 'A terrace above the river. A morning beside the pool. Find the apartment that feels like your kind of Luxor.' : 'From the first light over the West Bank to sunset on the Nile. Choose your experiences, then let us help bring your trip together.'}</p><div class="hero-buttons"><a class="collection-button" href="#${villas ? 'collection' : 'local-experiences'}">${villas ? 'Compare all 8 apartments' : 'Find your experience'} <span aria-hidden="true">↓</span></a><a class="text-link" href="/${villas ? 'tours' : 'villas'}/">${villas ? 'Add tours to your stay' : 'Find your Nile-side stay'} ↗</a></div></div><figure class="collection-hero-photo"><img src="${hero}" width="1000" height="1100" fetchpriority="high" alt="${villas ? 'Balcony overlooking the Nile and pool at Royal Nile Villas' : 'Hot air balloons above Luxor at sunrise'}"><figcaption>${villas ? 'Room to unwind. A river to remember.' : 'A different perspective on ancient Egypt.'}</figcaption></figure></header>
${`<div class="collection-trust"><a href="https://www.airbnb.co.uk/users/show/252258998" target="_blank" rel="noopener">Airbnb Superhost <strong>${HOST_TRUST.superhostYears} years</strong></a><span><strong>${HOST_TRUST.rating} ${STAR}</strong> host rating</span><span><strong>${HOST_TRUST.reviews}</strong> Airbnb reviews</span><span class="trust-context">Host-wide credentials · <a href="https://www.airbnb.co.uk/users/show/252258998" target="_blank" rel="noopener">Meet Abdol on Airbnb ↗</a></span></div>`}
${villas ? villaCollection() : tourCollection()}
<section class="collection-concierge"><div><p class="collection-kicker">A little local help</p><h2>Your stay. Your pace.<br>Let’s put it together.</h2><p>Tell us your dates, group size and what you would love to see. We can help coordinate accommodation, tours and transfers in one conversation.</p></div><a class="collection-button" href="${wa(villas ? "Hi! I'd like help choosing a Luxor apartment and planning my stay." : "Hi! I'd like help planning Luxor tours and accommodation for my trip.")}" target="_blank" rel="noopener">Plan with us on WhatsApp <span aria-hidden="true">↗</span></a></section>
</main>${footer().replace('</body>', villas ? '<script src="/villa-data.js"></script><script src="/availability-search.js"></script><script src="/villa-collection-search.js"></script></body>' : '</body>')}`;
}

module.exports = { collectionPage };
