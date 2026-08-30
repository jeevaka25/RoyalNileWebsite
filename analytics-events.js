/* Clicks and enquiry starts are intent signals, not completed bookings.
   Never send WhatsApp message text or visitor form values to analytics. */
(function () {
  function track(eventName, destinationHost) {
    var details = { destination_host: destinationHost, page_path: location.pathname };
    if (typeof gtag === 'function') gtag('event', eventName, details);
    if (typeof fbq === 'function') fbq('trackCustom', eventName, details);
  }
  document.addEventListener('click', function (event) {
    var anchor = event.target.closest ? event.target.closest('a[href]') : null;
    if (!anchor) return;
    var host;
    try { host = new URL(anchor.href, location.href).hostname; } catch (_) { return; }
    if (anchor.hasAttribute('data-tour-inquiry')) {
      track('enquiry_start', host);
    } else if (host === 'wa.me' || host === 'api.whatsapp.com') {
      track('whatsapp_click', host);
    } else if (/(^|\.)airbnb\.[a-z.]+$/.test(host)) {
      track('airbnb_click', host);
    } else if (host === 'booking.com' || host.endsWith('.booking.com')) {
      track('booking_click', host);
    }
  }, true);
  document.addEventListener('royal-inquiry-outbound', function () { track('whatsapp_click', 'wa.me'); });
})();
