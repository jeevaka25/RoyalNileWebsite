const { VILLAS, wa, optimizedImage } = require('./data');
const FEATURED_IDS = ['nile-view-luxury-2', 'nile-view-2'];
function versionBookingAssets(html) {
  const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
  return html.replace(/(href|src)="\/(booking-ui\.css|availability-search\.js|villa-data\.js|villa-collection-search\.js)(?:\?[^"\s]*)?"/g, (_, attr, file) => {
    const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',file))).digest('hex').slice(0,12);
    return `${attr}="/${file}?v=${hash}"`;
  });
}

function searchBar() {
  return `<aside class="booking-dock" aria-label="Apartment availability"><form id="availabilityForm" class="booking-form">
<div><label for="checkin">Check in</label><input type="date" id="checkin" required></div><div><label for="checkout">Check out</label><input type="date" id="checkout" required></div>
<button type="submit" id="searchBtn">Search availability</button>
<p id="searchFeedback" role="status" aria-live="polite"></p></form></aside>`;
}

function searchResults() {
  return `<div class="booking-results" id="bookingResults" hidden><p id="bookingResultsMessage" role="status" aria-live="polite"></p><a href="${wa("Hi! I'd like help checking apartment availability for my dates.")}" target="_blank" rel="noopener">WhatsApp us</a><button id="resetAvailability" type="button">Show all apartments</button></div>`;
}

function featuredProperties() {
  return `<section class="featured-stays" id="featured-properties" aria-labelledby="featured-heading"><div class="featured-heading"><div><p class="featured-kicker">Featured Properties</p><h2 id="featured-heading">Two special stays.<br><em>A little more to look forward to.</em></h2></div><p>Find your favourite corner of Luxor. Book either of these apartments directly with us and enjoy <strong>10% off your stay.</strong></p></div><div class="featured-grid">${FEATURED_IDS.map((id, i) => {
    const v = VILLAS.find(v => v.id === id);
    const name = i === 0 ? 'Luxury Nile View 2' : 'Nile View Apartment 2';
    return `<article class="featured-card"><a class="featured-photo" href="/villas/${id}" aria-label="Explore ${name}"><img src="${optimizedImage(v.cover || v.photos[0])}" alt="${i === 0 ? 'Palm garden and Nile outlook at Luxury Nile View 2' : 'Open-plan living room at Nile View Apartment 2'}" width="800" height="560" loading="lazy"><span>10% off · Book direct</span></a><div class="featured-content"><p class="featured-kicker">${i === 0 ? 'Private terrace · Second floor' : 'Poolside living · Ground floor'}</p><h3><a href="/villas/${id}">${name}</a></h3><p>${i === 0 ? 'Two queen bedrooms, a private terrace and a Nile-side outlook. Settle in above the pool and garden.' : 'A relaxed ground-floor home with a queen-and-twin layout and direct access to the shared pool.'}</p><p class="featured-specs">2 bedrooms <span>·</span> Up to 4 guests <span>·</span> Shared pool</p><a class="featured-direct" href="${wa(`Hi! I'd like to book ${name} directly with the 10% featured-property discount. Please check my dates and send a quote.`)}" target="_blank" rel="noopener">WhatsApp us · Save 10% <span aria-hidden="true">↗</span></a><div class="featured-platforms"><a href="${v.airbnbUrl}" target="_blank" rel="noopener">Book on Airbnb ↗</a><a href="${v.bookingUrl}" target="_blank" rel="noopener">Booking.com ↗</a></div><a class="featured-explore" href="/villas/${id}">Explore apartment →</a></div></article>`;
  }).join('')}</div><p class="featured-terms">The 10% offer is for direct bookings of these two featured apartments. Message us with your dates for availability and your discounted quote.</p></section>`;
}

function updateHome() {
  const fs = require('node:fs');
  const path = require('node:path');
  const file = path.join(__dirname, '..', 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<!-- BOOKING DOCK START -->[\s\S]*?<!-- BOOKING DOCK END -->/, `<!-- BOOKING DOCK START -->${searchBar()}<!-- BOOKING DOCK END -->`);
  html = html.replace(/<!-- FEATURED STAYS START -->[\s\S]*?<!-- FEATURED STAYS END -->/, `<!-- FEATURED STAYS START -->${featuredProperties()}<!-- FEATURED STAYS END -->`);
  fs.writeFileSync(file, versionBookingAssets(html));
}
module.exports = { searchBar, searchResults, featuredProperties, updateHome, FEATURED_IDS, versionBookingAssets };
