/* Shared homepage/listing search. Only an explicit live true is available. */
window.RoyalAvailability = (() => {
  const dateString = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const tomorrow = value => { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate()+1); return dateString(date); };
  async function fetchStatuses(checkin, checkout, inventory) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch('/api/availability', { method:'POST', headers:{'Content-Type':'application/json'}, signal:controller.signal,
        body:JSON.stringify({checkin, checkout, calendars:inventory.map(({id,roomId,icalUrl}) => ({id,roomId,icalUrl}))}) });
      if (!response.ok) throw new Error('Availability check failed');
      const payload = await response.json();
      const byId = new Map((Array.isArray(payload.results) ? payload.results : []).map(result => [result.id,result]));
      return inventory.map(villa => ({...villa, available:typeof byId.get(villa.id)?.available === 'boolean' ? byId.get(villa.id).available : null, availabilitySource:byId.get(villa.id)?.source || 'unverified'}));
    } finally { clearTimeout(timer); }
  }
  function mount({inventory, render, reset, resultsId}) {
    const form = document.getElementById('availabilityForm');
    if (!form) return;
    const ci = document.getElementById('checkin'), co = document.getElementById('checkout');
    const button = document.getElementById('searchBtn'), feedback = document.getElementById('searchFeedback');
    const results = document.getElementById('bookingResults'), message = document.getElementById('bookingResultsMessage');
    let revision = 0;
    ci.min = dateString(new Date()); co.min = tomorrow(ci.min);
    function cancel() { revision++; button.disabled=false; button.textContent='Search availability'; form.removeAttribute('aria-busy'); }
    function clear() { cancel(); form.reset(); co.min=tomorrow(ci.min); feedback.textContent=''; results.hidden=true; reset(); }
    function datesChanged() {
      cancel(); results.hidden=true; feedback.textContent=''; reset();
      co.min=tomorrow(ci.value || ci.min);
      if (co.value && co.value < co.min) co.value='';
    }
    ci.addEventListener('change',datesChanged); co.addEventListener('change',datesChanged);
    document.getElementById('resetAvailability').addEventListener('click',clear);
    form.addEventListener('submit',async event => {
      event.preventDefault();
      if (!ci.value || !co.value || ci.value < dateString(new Date()) || co.value <= ci.value || !form.reportValidity()) {
        feedback.textContent='Choose a check-in date today or later and a check-out after check-in.'; return;
      }
      const request = ++revision, checkin=ci.value, checkout=co.value;
      button.disabled=true; button.textContent='Checking…'; feedback.textContent=''; form.setAttribute('aria-busy','true');
      results.hidden=true;
      try {
        const statuses = await fetchStatuses(checkin,checkout,inventory);
        if (request !== revision) return;
        const available = statuses.filter(v => v.available === true), unknown = statuses.filter(v => v.available === null).length;
        render(available,checkin,checkout);
        message.textContent=`${available.length} of ${inventory.length} apartments verified available · ${checkin} to ${checkout}.${unknown ? ` ${unknown} could not be verified; ask us to check these directly.` : ''}${!available.length ? ' Try different dates or WhatsApp us for help.' : ' Calendar availability is not a reservation; confirm when booking.'}`;
      } catch {
        if (request !== revision) return;
        render([]); message.textContent='Live availability could not be checked. Please try again or WhatsApp us to confirm your dates.';
      } finally {
        if (request === revision) {
          button.disabled=false; button.textContent='Search availability'; form.removeAttribute('aria-busy'); results.hidden=false;
          document.getElementById(resultsId).scrollIntoView({behavior:'smooth',block:'start'});
        }
      }
    });
    const nav = document.querySelector('.nav'), dock = document.querySelector('.booking-dock');
    const measure = () => { document.body.style.setProperty('--booking-nav-height',`${nav.getBoundingClientRect().height}px`); document.body.style.setProperty('--booking-bar-height',`${dock.getBoundingClientRect().height}px`); };
    new ResizeObserver(measure).observe(nav); new ResizeObserver(measure).observe(dock); measure();
    return {clear};
  }
  return {fetchStatuses,mount};
})();
