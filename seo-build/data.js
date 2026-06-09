// ============================================================
// SEO landing-page data (single source of truth)
// Generated pages are built by generate.js from this file.
// Keep copy factual — ratings/reviews mirror the live Airbnb/Booking listings.
// ============================================================

const SITE = {
  brand: 'Royal Nile Villas',
  origin: 'https://egyptvillastours.com',        // canonical host (non-www)
  whatsapp: '201204421652',
  email: 'royalhomeluxor@gmail.com',
  geo: { lat: 25.691162, lng: 32.623042 },
  addressLocality: 'Al Aqaletah, West Bank',
  addressRegion: 'Luxor',
  addressCountry: 'EG',
  // Weighted aggregate across the 8 listings below (sum reviews = 1345).
  aggregate: { ratingValue: '4.93', reviewCount: 1345 },
  ga: 'G-12JHJ887DG',
  metaPixel: '665393768919342',
  ogImage: '/optimized-assets/villa-assets/generated-royal-nile-exteriors/06-wide-pool-garden-nile-view-day.webp',
};

function wa(text) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

// ------- image path helper (mirrors index.html optimizedImage) -------
function optimizedImage(src) {
  if (!src || /^https?:\/\//.test(src)) return src;
  if (src.startsWith('/')) return src;
  if (src.startsWith('optimized-assets/')) return '/' + src;
  if (/^(villa-assets|tour-assets|restaurant-assets)\//.test(src) && /\.(png|jpe?g)$/i.test(src)) {
    return '/optimized-assets/' + src.replace(/\.(png|jpe?g)$/i, '.webp');
  }
  return src;
}
function siteAsset(src) {
  if (!src || /^https?:\/\//.test(src) || src.startsWith('/')) return src;
  return '/' + src;
}

// ============================================================
// TOURS — primarySlug is the canonical URL; aliases 301-consolidate to it.
// ============================================================
const TOURS = [
  {
    id: 'balloon',
    primarySlug: 'hot-air-balloon-luxor',
    aliases: ['hot-air-balloon-ride', 'hot-air-balloon-tour', 'balloon-tour', 'balloon-ride', 'balloon'],
    h1: 'Hot Air Balloon Ride Over Luxor at Sunrise',
    title: 'Hot Air Balloon Ride Over Luxor at Sunrise | Valley of the Kings',
    metaDesc: 'Float above the Valley of the Kings at dawn on a Luxor hot air balloon ride. 45–60 min sunrise flight, hotel pickup, and a flight certificate. Book on WhatsApp.',
    duration: '45–60 minute flight',
    overview: 'Lift off from Luxor’s West Bank just before dawn and drift in silence over the Valley of the Kings, the Temple of Hatshepsut, and the green ribbon of the Nile. As the sun breaks the horizon it turns 3,000 years of temples and tombs to gold — the single most breathtaking way to see ancient Thebes. Your flight lasts around 45–60 minutes and includes hotel pickup and drop-off and a souvenir flight certificate.',
    highlights: [
      'Sunrise lift-off from the West Bank launch site',
      'Panoramic views over the Valley of the Kings & Hatshepsut Temple',
      'See the Nile, Colossi of Memnon and West Bank from 2,000 ft',
      'Experienced, licensed balloon pilots',
      'Hotel pickup & drop-off included',
      'Souvenir flight certificate',
    ],
    coverImage: 'tour-assets/balloon-cover-no-caption.png',
    heroVideo: 'tour-assets/balloon/hero-loop.mp4',
    photos: ['tour-assets/balloon-01-begin-before-sunrise.png','tour-assets/balloon-02-lift-into-golden-sky.png','tour-assets/balloon-03-ancient-luxor-from-above.png','tour-assets/balloon-04-moments-you-never-forget.png','tour-assets/balloon-05-float-over-living-history.png','tour-assets/balloon-06-reserve-your-sunrise-ride.png'],
    ticketsExtra: false,
    faqs: [
      ['What time does the Luxor balloon ride start?', 'Flights launch at sunrise, so pickup from your villa or hotel is usually between 4:00 and 5:30 am depending on the season. The whole experience takes around three hours door to door, with 45–60 minutes in the air.'],
      ['Is hotel pickup included?', 'Yes. We arrange pickup and drop-off from your accommodation on Luxor’s West Bank or East Bank as part of the balloon package.'],
      ['When is the best time of year for a balloon flight?', 'Balloons fly year-round in Luxor, weather permitting. Mornings from October to April are cooler and especially clear. Flights only go ahead when wind conditions are safe.'],
    ],
  },
  {
    id: 'west-bank',
    primarySlug: 'valley-of-the-kings-tour',
    aliases: ['west-bank-tour', 'luxor-west-bank-tour', 'west-bank'],
    h1: 'Valley of the Kings & Luxor West Bank Tour',
    title: 'Valley of the Kings Tour, Luxor | Private West Bank Day Tour',
    metaDesc: 'Private Luxor West Bank tour: Valley of the Kings, Temple of Hatshepsut and the Colossi of Memnon with an Egyptologist guide and hotel pickup. Book on WhatsApp.',
    duration: 'Approx. 3 hours',
    overview: 'Spend a morning among the monuments of ancient Thebes with your own private Egyptologist guide. This West Bank tour takes in the Valley of the Kings — burial place of Tutankhamun and Ramesses — the soaring terraces of the Temple of Hatshepsut, and the towering Colossi of Memnon. With private transfers and hotel pickup from your villa, it’s the easiest and most rewarding way to see Luxor’s greatest sites at your own pace.',
    highlights: [
      'Valley of the Kings — royal tombs of the New Kingdom',
      'Temple of Hatshepsut at Deir el-Bahari',
      'The Colossi of Memnon',
      'Private, licensed Egyptologist guide',
      'Private air-conditioned transfers & hotel pickup',
      'Bottled water provided',
    ],
    heroVideo: 'tour-assets/west-bank/hero-loop.mp4',
    photos: ['tour-assets/west-bank/01-begin-at-the-colossi.png','tour-assets/west-bank/02-enter-the-valley-of-kings.png','tour-assets/west-bank/03-tombs-alive-with-colour.png','tour-assets/west-bank/04-temple-of-a-queen.png','tour-assets/west-bank/05-crafted-by-hand.png','tour-assets/west-bank/06-a-day-among-pharaohs.png'],
    ticketsExtra: true,
    faqs: [
      ['How long is the Valley of the Kings tour?', 'The tour runs around 3 hours, plus transfer time from your accommodation. It can be extended or combined with the East Bank temples or a balloon ride on request.'],
      ['Are entrance tickets included?', 'Entrance tickets are extra and must be paid by tourist credit card at each site’s ticket office, as required by local law. Your guide will help you choose which tombs to enter.'],
      ['Is a guide included?', 'Yes — a private, licensed Egyptologist guide accompanies you throughout, along with private air-conditioned transfers and hotel pickup and drop-off.'],
    ],
  },
  {
    id: 'east-bank',
    primarySlug: 'karnak-luxor-temple-tour',
    aliases: ['east-bank-tour', 'luxor-east-bank-tour', 'east-bank'],
    h1: 'Karnak & Luxor Temple Tour (East Bank)',
    title: 'Karnak & Luxor Temple Tour | Private Luxor East Bank Day Tour',
    metaDesc: 'Private East Bank tour of Karnak Temple and Luxor Temple with an Egyptologist guide, air-conditioned transfers and hotel pickup. Book your Luxor tour on WhatsApp.',
    duration: 'Approx. 3 hours',
    overview: 'Explore the great temples of Luxor’s East Bank with a private Egyptologist guide. Walk the forest of 134 giant columns at Karnak — the largest religious complex ever built — then visit the elegant Luxor Temple, glowing gold in the late afternoon light. Private air-conditioned transfers and hotel pickup make this a relaxed half-day among some of Egypt’s most impressive monuments.',
    highlights: [
      'Karnak Temple and its Great Hypostyle Hall',
      'The obelisks and Avenue of Sphinxes',
      'Luxor Temple in the golden hour',
      'Private, licensed Egyptologist guide',
      'Private luxury air-conditioned van & hotel pickup',
      'Bottled water provided',
    ],
    heroVideo: 'tour-assets/east-bank/hero-loop.mp4',
    photos: ['tour-assets/east-bank/01-arrive-at-karnak.png','tour-assets/east-bank/02-forest-of-134-columns.png','tour-assets/east-bank/03-obelisks-of-karnak.png','tour-assets/east-bank/04-walk-the-sphinx-avenue.png','tour-assets/east-bank/05-luxor-temple-at-gold-hour.png','tour-assets/east-bank/06-private-comfort-throughout.png'],
    ticketsExtra: true,
    faqs: [
      ['What does the East Bank tour include?', 'A private Egyptologist guide, private luxury air-conditioned transfers, hotel pickup and drop-off, visits to Karnak and Luxor Temple, and bottled water. Entrance tickets are extra.'],
      ['Can I combine it with the West Bank tour?', 'Yes. Many guests pair the East Bank temples with the West Bank (Valley of the Kings) tour for a full day. Ask us on WhatsApp for a combined package.'],
      ['What time is best to visit Luxor Temple?', 'Late afternoon, when the light turns golden and the temple is later beautifully lit after dark. We can time the tour to finish there.'],
    ],
  },
  {
    id: 'desert',
    primarySlug: 'luxor-desert-safari',
    aliases: ['desert-quad-safari', 'quad-bike-safari', 'desert'],
    h1: 'Luxor Desert Quad Bike Safari',
    title: 'Luxor Desert Quad Bike Safari | Sunset Ride & Bedouin Tea',
    metaDesc: 'Ride a quad bike across the Western Desert near Luxor at sunset, with a Bedouin tea stop and hotel pickup. Book your Luxor desert safari on WhatsApp.',
    duration: 'Afternoon to sunset',
    overview: 'Trade the temples for open desert on this afternoon quad bike safari. After a safety briefing you’ll ride out across the golden dunes and ancient trails of the Western Desert, stopping at a Bedouin village for traditional tea and bread. Time it right and you’ll watch the sun sink over the sand before riding home under the first stars — a thrilling counterpoint to Luxor’s ancient sights.',
    highlights: [
      'Quad bike ride across the Western Desert',
      'Sunset over the dunes',
      'Traditional Bedouin tea stop',
      'Safety briefing, helmet and guide included',
      'Hotel pickup & drop-off',
    ],
    coverImage: 'tour-assets/desert/03-ride-the-golden-trails.png',
    heroVideo: 'tour-assets/desert/hero-loop.mp4',
    photos: ['tour-assets/desert/01-arrive-in-the-desert.png','tour-assets/desert/02-safety-briefing.png','tour-assets/desert/03-ride-the-golden-trails.png','tour-assets/desert/04-desert-viewpoint.png','tour-assets/desert/05-bedouin-tea-stop.png','tour-assets/desert/06-sunset-ride-home.png'],
    ticketsExtra: false,
    faqs: [
      ['Do I need quad biking experience?', 'No. The route suits beginners, and you’ll get a full safety briefing and helmet before setting off. A guide rides with the group throughout.'],
      ['What time does the desert safari run?', 'It departs in the afternoon and is timed to catch the sunset over the dunes, returning to your accommodation in the evening.'],
      ['Is pickup included?', 'Yes — hotel or villa pickup and drop-off is included.'],
    ],
  },
  {
    id: 'abu-simbel',
    primarySlug: 'abu-simbel-tour',
    aliases: ['abu-simbel-expedition', 'aswan-abusimbel-tour', 'abu-simbel'],
    h1: 'Abu Simbel Tour from Luxor',
    title: 'Abu Simbel Tour from Luxor | Private Day Trip to Ramesses II',
    metaDesc: 'Private day trip from Luxor to the great temples of Abu Simbel in an air-conditioned van. Same-day return, hotel pickup, optional guide. Book on WhatsApp.',
    duration: 'Full day (long drive each way)',
    overview: 'Journey deep into southern Egypt to stand before Ramesses II’s masterpiece — the colossal rock-cut temples of Abu Simbel, carved from a mountainside over 3,000 years ago and rescued from the rising Nile in one of history’s greatest engineering feats. This private day trip departs Luxor early in a comfortable air-conditioned van with a professional driver, returning the same evening. A licensed guide can be added on request.',
    highlights: [
      'The Great Temple of Ramesses II',
      'The Temple of Nefertari',
      'Lake Nasser views',
      'Private modern air-conditioned van & professional driver',
      'Hotel pickup & same-day return to Luxor',
      'Optional Egyptologist guide (extra)',
    ],
    coverImage: 'tour-assets/abu-simbel/03-temple-of-ramesses-ii.png',
    heroVideo: 'tour-assets/abu-simbel/hero-loop.mp4',
    photos: ['tour-assets/abu-simbel/01-early-morning-departure.png','tour-assets/abu-simbel/02-arrive-at-abu-simbel.png','tour-assets/abu-simbel/03-temple-of-ramesses-ii.png','tour-assets/abu-simbel/04-inside-the-sanctuary.png','tour-assets/abu-simbel/05-temple-of-nefertari.png','tour-assets/abu-simbel/06-lake-nasser-views.png'],
    ticketsExtra: true,
    faqs: [
      ['How long is the drive to Abu Simbel?', 'It’s a long day — roughly 8 hours of driving each way from Luxor, with the return to Luxor the same evening. The van is modern and air-conditioned for comfort.'],
      ['Is a guide included?', 'The standard tour includes a private air-conditioned van and professional driver. A licensed Egyptologist guide can be arranged for an additional cost.'],
      ['Are entrance tickets included?', 'Entrance tickets are extra and paid at the site. We’ll advise on current prices when you book.'],
    ],
  },
  {
    id: 'aswan',
    primarySlug: 'aswan-philae-temple-tour',
    aliases: ['aswan-tour', 'aswan-philae-temple', 'aswan-and-philae-temple', 'aswan'],
    h1: 'Aswan & Philae Temple Tour from Luxor',
    title: 'Aswan & Philae Temple Tour from Luxor | Private Day Trip',
    metaDesc: 'Private day trip from Luxor to Edfu Temple, the Aswan High Dam and the island Temple of Philae. Air-conditioned van, hotel pickup. Book on WhatsApp.',
    duration: 'Full day',
    overview: 'Head south from Luxor for a full day exploring the highlights between Luxor and Aswan. Visit the beautifully preserved Temple of Horus at Edfu en route, see the engineering of the Aswan High Dam, then take a short motorboat ride to the romantic island Temple of Philae, dedicated to the goddess Isis. Travel in a private air-conditioned van with a professional driver, with an optional guide available.',
    highlights: [
      'Temple of Horus at Edfu',
      'The Aswan High Dam',
      'Motorboat to the island Temple of Philae (Isis)',
      'Private modern air-conditioned van & professional driver',
      'Hotel pickup & drop-off',
      'Optional Egyptologist guide (extra)',
    ],
    coverImage: 'tour-assets/aswan/03-temple-of-isis.png',
    heroVideo: 'tour-assets/aswan/hero-loop.mp4',
    photos: ['tour-assets/aswan/01-private-drive-to-aswan.png','tour-assets/aswan/02-boat-to-philae.png','tour-assets/aswan/03-temple-of-isis.png','tour-assets/aswan/04-aswan-high-dam.png','tour-assets/aswan/05-nubian-lunch.png','tour-assets/aswan/06-return-to-luxor.png'],
    ticketsExtra: true,
    faqs: [
      ['What does the Aswan tour cover?', 'Edfu Temple, the Aswan High Dam and the island Temple of Philae, reached by a short motorboat ride. It’s a full-day private tour returning to Luxor in the evening.'],
      ['Is the boat to Philae included?', 'The motorboat transfer to Philae island is part of the tour; the temple entrance ticket is paid separately at the site.'],
      ['Can I add a guide?', 'Yes. The standard tour is a private van with driver; a licensed guide can be added for an extra cost — just ask when booking.'],
    ],
  },
  {
    id: 'nile-boat-cruise',
    primarySlug: 'sunset-nile-boat-cruise',
    aliases: ['nile-boat-cruise', 'nile-sunset-cruise', 'nile-cruise'],
    h1: 'Sunset Nile Boat Cruise in Luxor',
    title: 'Sunset Nile Boat Cruise, Luxor | Dinner on the Nile',
    metaDesc: 'A peaceful two-hour sunset cruise on the Nile in Luxor with authentic Egyptian dinner, tea and private transfers. Book your Nile boat cruise on WhatsApp.',
    duration: 'Approx. 2 hours',
    overview: 'Unwind on the water as Luxor glows at golden hour. This private two-hour Nile boat cruise glides past the temples and palm-lined banks while you enjoy an authentic Egyptian dinner, tea and coffee on board. With round-trip transfers, taxes and service all included, it’s the perfect relaxed evening after a day among the temples.',
    highlights: [
      'Two-hour cruise on the Nile at sunset',
      'Authentic Egyptian dinner on board',
      'Tea, coffee & bottled water included',
      'Round-trip private transfers',
      'Taxes & service charges included',
    ],
    coverImage: 'tour-assets/nile-boat-cruise/03-sail-into-sunset.png',
    heroVideo: 'tour-assets/nile-boat-cruise/hero-loop.mp4',
    photos: ['tour-assets/nile-boat-cruise/01-private-pickup.png','tour-assets/nile-boat-cruise/02-board-the-nile-boat.png','tour-assets/nile-boat-cruise/03-sail-into-sunset.png','tour-assets/nile-boat-cruise/04-dinner-on-the-nile.png','tour-assets/nile-boat-cruise/05-tea-and-nile-breeze.png','tour-assets/nile-boat-cruise/06-golden-hour-return.png'],
    ticketsExtra: false,
    faqs: [
      ['How long is the Nile cruise?', 'The cruise lasts around two hours, timed for sunset. Round-trip transfers from your accommodation are included.'],
      ['Is dinner included?', 'Yes — an authentic Egyptian dinner is served on board, along with tea, coffee and bottled water.'],
      ['Is it private?', 'The cruise is arranged with private transfers; let us know your group size on WhatsApp and we’ll confirm the best boat option.'],
    ],
  },
  {
    id: 'red-sea',
    primarySlug: 'hurghada-snorkelling-adventure',
    aliases: ['hurghada-snorkeling-adventure', 'red-sea-snorkelling', 'red-sea-snorkeling', 'red-sea'],
    h1: 'Hurghada Red Sea Snorkelling Trip from Luxor',
    title: 'Hurghada Snorkelling Day Trip from Luxor | Red Sea Adventure',
    metaDesc: 'Full-day Red Sea snorkelling escape from Luxor to Hurghada — coral reefs, tropical fish and turquoise water with private transport. Book on WhatsApp.',
    duration: 'Full day',
    overview: 'Swap the desert for the sea on a full-day Red Sea escape. Travel by private air-conditioned transport from Luxor to Hurghada, board a boat out to the reefs, and snorkel over bright coral gardens teeming with tropical fish in clear turquoise water. A refreshing change of pace and a brilliant day out for families and couples alike.',
    highlights: [
      'Snorkelling over Red Sea coral reefs',
      'Tropical fish and clear turquoise water',
      'Boat trip from Hurghada',
      'Private round-trip air-conditioned transport',
      'Taxes & service charges included',
    ],
    coverImage: 'tour-assets/red-sea/04-tropical-fish-below.png',
    heroVideo: 'tour-assets/red-sea/hero-loop.mp4',
    photos: ['tour-assets/red-sea/01-private-drive-to-hurghada.png','tour-assets/red-sea/02-board-the-red-sea-boat.png','tour-assets/red-sea/03-coral-reef-snorkelling.png','tour-assets/red-sea/04-tropical-fish-below.png','tour-assets/red-sea/05-lunch-on-deck.png','tour-assets/red-sea/06-turquoise-water-finale.png'],
    ticketsExtra: false,
    faqs: [
      ['How far is Hurghada from Luxor?', 'It’s around a 3–4 hour drive each way. You’ll travel in private air-conditioned transport with an experienced driver, returning to Luxor the same day.'],
      ['Is snorkelling gear provided?', 'Snorkelling equipment is available on the boat. Let us know if you need any specifics when booking.'],
      ['Is it suitable for families?', 'Yes — it’s a popular family day out. Tell us your group on WhatsApp and we’ll tailor the arrangements.'],
    ],
  },
  {
    id: 'abydos-dendera',
    primarySlug: 'abydos-dendera-tour',
    aliases: ['abydos-and-dendera-tour', 'abydos-dendera'],
    h1: 'Abydos & Dendera Temples Tour from Luxor',
    title: 'Abydos & Dendera Temples Tour from Luxor | Private Day Trip',
    metaDesc: 'Private full-day tour from Luxor to the Temple of Seti I at Abydos and the Hathor Temple at Dendera. Air-conditioned van, hotel pickup. Book on WhatsApp.',
    duration: 'Full day',
    overview: 'Travel north from Luxor to two of Egypt’s most beautifully preserved temples. At Abydos, the Temple of Seti I holds the famous King List and some of the finest carved reliefs in the country. At Dendera, the Hathor Temple astonishes with its painted ceilings and the celebrated Dendera zodiac. This full-day private tour travels in a comfortable air-conditioned van with a professional driver; a guide can be added on request.',
    highlights: [
      'Temple of Seti I at Abydos',
      'Hathor Temple and the Dendera zodiac ceiling',
      'Some of the best-preserved reliefs in Egypt',
      'Private modern air-conditioned van & professional driver',
      'Hotel pickup & drop-off',
      'Optional Egyptologist guide (extra)',
    ],
    coverImage: 'tour-assets/abydos-dendera/04-dendera-temple-of-hathor.png',
    heroVideo: 'tour-assets/abydos-dendera/hero-loop.mp4',
    photos: ['tour-assets/abydos-dendera/01-private-drive-north.png','tour-assets/abydos-dendera/02-abydos-temple-arrival.png','tour-assets/abydos-dendera/03-temple-of-seti-i.png','tour-assets/abydos-dendera/04-dendera-temple-of-hathor.png','tour-assets/abydos-dendera/05-dendera-zodiac-ceiling.png','tour-assets/abydos-dendera/06-sacred-temple-journey.png'],
    ticketsExtra: true,
    faqs: [
      ['How long is the Abydos and Dendera tour?', 'It’s a full-day private tour heading north from Luxor, returning in the evening. Travel is in a comfortable air-conditioned van with a professional driver.'],
      ['Are entrance tickets included?', 'Temple entry tickets are extra and paid at each site. We’ll let you know the current prices when you book.'],
      ['Can I add a guide?', 'Yes — a licensed Egyptologist guide can be arranged for an additional cost.'],
    ],
  },
];

// ============================================================
// VILLAS — slug = id, served at /villas/<slug>
// rating/reviews mirror the live listings.
// ============================================================
const VILLAS = [
  { id:'royal-home-nile-view', name:'Royal Home Luxor — Nile View', location:'West Bank, Luxor', guests:4, bedrooms:2, beds:2, bathrooms:1, rating:4.91, reviews:404, floor:'Top Floor', viewType:'Nile, Pool & Garden', bedsConfig:'2 Queen Beds',
    features:['Private Balcony','Shared Pool','Rose Garden','Rooftop Restaurant','15min Walk to Ferry','Self Check-in','Extra Spacious'],
    description:'Top-floor apartment with a private entrance and balcony overlooking the pool, green countryside, and the River Nile. Part of the enchanting Royal Home Villa — just 15 minutes’ walk from the West Bank ferry and waterfront restaurants.',
    airbnbUrl:'https://www.airbnb.co.uk/rooms/33825380', bookingUrl:'https://www.booking.com/Pulse-CZL3W5',
    cover:'villa-assets/imagen-enhanced/royal-home-nile-view-covers/cover-pool-facade.jpeg',
    photos:['villa-assets/imagen-enhanced/royal-home-nile-view/01-overhead-pool.png','villa-assets/imagen-enhanced/royal-home-nile-view/03-pool-facade.png','villa-assets/imagen-enhanced/royal-home-nile-view/06-living-room-wide.png','villa-assets/imagen-enhanced/royal-home-nile-view/04-canopy-bedroom.png','villa-assets/imagen-enhanced/royal-home-nile-view-additions/07-rooftop-nile-view-polished.png','villa-assets/imagen-enhanced/royal-home-nile-view-additions/10-balcony-pool-view-polished.png'] },
  { id:'royal-home-pool-view', name:'Royal Home Luxor — Pool View', location:'West Bank, Luxor', guests:4, bedrooms:2, beds:3, bathrooms:1, rating:4.94, reviews:464, floor:'Ground Floor', viewType:'Pool, Valley & Garden', bedsConfig:'1 Queen + 2 Singles',
    features:['Direct Pool Access','Private Entrance','Rose Garden & Hammock','Rooftop Nile Sunsets','Daily Housekeeping','Self Check-in'],
    description:'Ground-floor apartment with private entrance and direct pool access. Lounge in the rose garden hammock after a day exploring ancient temples. Rooftop terrace for unforgettable Nile sunsets.',
    airbnbUrl:'https://www.airbnb.co.uk/rooms/33760041', bookingUrl:'https://www.booking.com/Pulse-DGM5QI',
    cover:'villa-assets/imagen-enhanced/royal-home-pool-view/01-pool-facade.png',
    photos:['villa-assets/imagen-enhanced/royal-home-pool-view/01-pool-facade.png','villa-assets/imagen-enhanced/royal-home-pool-view/03-garden-hammock.png','villa-assets/imagen-enhanced/royal-home-pool-view/05-living-room.png','villa-assets/imagen-enhanced/royal-home-pool-view/04-kitchen.png','villa-assets/imagen-enhanced/royal-home-pool-view/06-bedroom.png','villa-assets/imagen-enhanced/royal-home-pool-view-additions/08-rooftop-terrace-night-polished.png'] },
  { id:'sky-penthouse-1', name:'Royal Nile Villa — Sky Penthouse 1', location:'Al Aqaletah, West Bank', guests:4, bedrooms:2, beds:3, bathrooms:1, rating:4.92, reviews:36, floor:'Top Floor Penthouse', viewType:'Panoramic Nile & Desert', bedsConfig:'1 Queen + 2 Singles',
    features:['Panoramic 360° Views','Private Terrace','14m Swimming Pool','On-site Restaurant','Free Ferry Shuttle','TV & Workspace'],
    description:'Top-floor penthouse with breathtaking panoramic views of the Nile, desert mountains, pool, and lush gardens. The ultimate Luxor vantage point — watch the sunrise paint the river gold from your private terrace.',
    airbnbUrl:'https://www.airbnb.co.uk/rooms/1505758884972582166', bookingUrl:'https://www.booking.com/Pulse-a5GOdn',
    cover:'villa-assets/imagen-enhanced/sky-penthouse-1/01-nile-pool-view.png',
    photos:['villa-assets/imagen-enhanced/sky-penthouse-1/01-nile-pool-view.png','villa-assets/imagen-enhanced/sky-penthouse-1/02-living-balcony.png','villa-assets/imagen-enhanced/sky-penthouse-1/03-living-dining.png','villa-assets/imagen-enhanced/sky-penthouse-1/05-double-bedroom-balcony.png','villa-assets/generated-royal-nile-exteriors/05-terrace-nile-view-sunset.png','villa-assets/generated-royal-nile-exteriors/03-pool-garden-nile-view-day.png'] },
  { id:'sky-penthouse-2', name:'Royal Nile Villa — Sky Penthouse 2', location:'Luxor, West Bank', guests:4, bedrooms:2, beds:3, bathrooms:1, rating:4.92, reviews:48, floor:'Top Floor Penthouse', viewType:'Panoramic Nile, Desert & Mountains', bedsConfig:'1 Queen + 2 Singles',
    features:['Guest Favourite','Panoramic 360° Views','Private Terrace','14m Swimming Pool','On-site Restaurant','TV & Workspace'],
    description:'Guest-favourite penthouse with the same stunning panoramic views. A dedicated workspace makes it ideal for digital nomads seeking inspiration from the timeless Nile landscape.',
    airbnbUrl:'https://www.airbnb.co.uk/rooms/1505764523387331978', bookingUrl:'https://www.booking.com/Pulse-XuOc35',
    cover:'villa-assets/imagen-enhanced/sky-penthouse-2/01-living-balcony.png',
    photos:['villa-assets/imagen-enhanced/sky-penthouse-2/02-nile-pool-view.png','villa-assets/imagen-enhanced/sky-penthouse-2/01-living-balcony.png','villa-assets/imagen-enhanced/sky-penthouse-2/03-living-dining.png','villa-assets/imagen-enhanced/sky-penthouse-2/05-double-bedroom-balcony.png','villa-assets/generated-royal-nile-exteriors/05-terrace-nile-view-sunset.png','villa-assets/generated-royal-nile-exteriors/06-wide-pool-garden-nile-view-day.png'] },
  { id:'nile-view-luxury-1', name:'Royal Nile Villa — Luxury Nile View 1', location:'Al Aqaletah, West Bank', guests:4, bedrooms:2, beds:2, bathrooms:2, rating:4.97, reviews:153, floor:'2nd Floor', viewType:'Nile, Garden & Mountain', bedsConfig:'2 Queen Beds',
    features:['Highest Rated ★ 4.97','2 Bathrooms','2 Queen Beds','14m Swimming Pool','On-site Restaurant','Free Ferry Shuttle'],
    description:'Our highest-rated property. Two queen bedrooms with two bathrooms — perfect for couples travelling together, or families wanting extra space and privacy. Stunning Nile, garden, and mountain views from the 2nd floor.',
    airbnbUrl:'https://www.airbnb.co.uk/rooms/959398645193866526', bookingUrl:'https://www.booking.com/Pulse-Cq1VIp',
    cover:'villa-assets/imagen-enhanced/nile-view-luxury-1/03-balcony-nile-pool.png',
    photos:['villa-assets/imagen-enhanced/nile-view-luxury-1/03-balcony-nile-pool.png','villa-assets/imagen-enhanced/nile-view-luxury-1/07-living-room-sofa.png','villa-assets/imagen-enhanced/nile-view-luxury-1/04-white-canopy-bedroom.png','villa-assets/imagen-enhanced/nile-view-luxury-1/05-garden-palm-nile-view.png','villa-assets/generated-royal-nile-exteriors/05-terrace-nile-view-sunset.png','villa-assets/generated-royal-nile-exteriors/03-pool-garden-nile-view-day.png'] },
  { id:'nile-view-1', name:'Royal Nile Villa — Nile View Apartment 1', location:'Al Aqaletah, West Bank', guests:4, bedrooms:2, beds:3, bathrooms:1, rating:4.90, reviews:58, floor:'Ground Floor', viewType:'Nile, Garden & Mountain', bedsConfig:'1 Queen + 2 Singles',
    features:['Direct Pool Access','Ground Floor','Garden & Mountain Views','14m Swimming Pool','On-site Restaurant','Free Ferry Shuttle'],
    description:'Ground-floor apartment with direct pool access and beautiful garden and mountain views. Ideal for families wanting easy outdoor access — step right from your door to the 14-metre pool.',
    airbnbUrl:'https://www.airbnb.co.uk/rooms/950750256318960064', bookingUrl:'https://www.booking.com/Pulse-eWXYX5',
    cover:'villa-assets/generated-nile-view-interiors/02-living-room-balcony.png',
    photos:['villa-assets/generated-nile-view-interiors/02-living-room-balcony.png','villa-assets/generated-nile-view-interiors/01-kitchen-wide.png','villa-assets/generated-nile-view-interiors/04-twin-bedroom-front.png','villa-assets/generated-nile-view-interiors/05-double-bedroom-desk.png','villa-assets/generated-royal-nile-exteriors/03-pool-garden-nile-view-day.png','villa-assets/generated-royal-nile-exteriors/06-wide-pool-garden-nile-view-day.png'] },
  { id:'nile-view-luxury-2', name:'Royal Nile Villas — Luxury Nile View 2', location:'Al Aqaletah, West Bank', guests:4, bedrooms:2, beds:2, bathrooms:1, rating:4.94, reviews:124, floor:'2nd Floor', viewType:'Nile, Pool & Garden', bedsConfig:'2 Queen Beds',
    features:['Guest Favourite','Private Terrace','Incredible Nile Views','14m Swimming Pool','On-site Restaurant','Free Ferry Shuttle'],
    description:'Second-floor apartment with a private terrace and incredible Nile River, pool, and garden views. A guest favourite known for spectacular sunset views from the terrace.',
    airbnbUrl:'https://www.airbnb.co.uk/rooms/959415706303071560', bookingUrl:'https://www.booking.com/Pulse-ILh8Q3',
    cover:'villa-assets/imagen-enhanced/nile-view-luxury-2/05-garden-palm-nile-view.png',
    photos:['villa-assets/imagen-enhanced/nile-view-luxury-2/03-balcony-nile-pool.png','villa-assets/imagen-enhanced/nile-view-luxury-2/07-living-room-sofa.png','villa-assets/imagen-enhanced/nile-view-luxury-2/04-white-canopy-bedroom.png','villa-assets/imagen-enhanced/nile-view-luxury-2/05-garden-palm-nile-view.png','villa-assets/generated-royal-nile-exteriors/05-terrace-nile-view-sunset.png','villa-assets/generated-royal-nile-exteriors/06-wide-pool-garden-nile-view-day.png'] },
  { id:'nile-view-2', name:'Royal Nile Villas — Nile View Apartment 2', location:'Al Aqaletah, West Bank', guests:4, bedrooms:2, beds:3, bathrooms:1, rating:4.91, reviews:58, floor:'Ground Floor', viewType:'Nile & Desert View', bedsConfig:'1 Queen + 2 Singles',
    features:['Direct Pool Access','Ground Floor','Desert & Nile Views','14m Swimming Pool','On-site Restaurant','Free Ferry Shuttle'],
    description:'Ground-floor apartment with direct pool access and sweeping desert and Nile views. The same great layout as Nile View 1, with a dramatic desert vista from your windows.',
    airbnbUrl:'https://www.airbnb.co.uk/rooms/952260705771172731', bookingUrl:'https://www.booking.com/Pulse-vTu0Xy',
    cover:'villa-assets/generated-nile-view-interiors/09-living-open-plan-flow.png',
    photos:['villa-assets/generated-nile-view-interiors/09-living-open-plan-flow.png','villa-assets/generated-nile-view-interiors/01-kitchen-wide.png','villa-assets/generated-nile-view-interiors/05-double-bedroom-desk.png','villa-assets/generated-nile-view-interiors/04-twin-bedroom-front.png','villa-assets/generated-royal-nile-exteriors/06-wide-pool-garden-nile-view-day.png','villa-assets/generated-royal-nile-exteriors/05-terrace-nile-view-sunset.png'] },
];

module.exports = { SITE, TOURS, VILLAS, wa, optimizedImage, siteAsset };
