/* Contact handoffs are intent, not received enquiries or completed bookings.
   Only authored page/CTA identifiers are sent; never message or form values. */
(function () {
  function context(anchor, mode, tourName) {
    var section = anchor && anchor.closest ? anchor.closest('section, header, nav, footer') : null;
    var attr = function (name) { return anchor && anchor.getAttribute ? anchor.getAttribute(name) : null; };
    var content = attr('data-content-id') || location.pathname.split('/').filter(Boolean).pop() || 'home';
    // Map the authored tour title to a stable ID without transmitting form data.
    if (tourName && /eclipse/i.test(tourName)) content = 'eclipse-2027';
    return { page_path: location.pathname, content_id: content,
      cta_location: attr('data-cta-location') || (section && (section.id || (section.tagName || '').toLowerCase())) || 'page',
      enquiry_mode: mode || 'direct_link' };
  }
  function track(eventName, host, details) {
    if (typeof window !== 'undefined' && window.siteAnalyticsExcluded) return;
    details.destination_host = host;
    if (typeof gtag === 'function') gtag('event', eventName, details);
    if (typeof fbq === 'function') {
      fbq('trackCustom', eventName, details);
      // Preserve established campaign optimization; this Lead remains contact intent.
      if (['whatsapp_click', 'airbnb_click', 'booking_click'].includes(eventName)) {
        fbq('track', 'Lead', { content_category: eventName.replace('_click', ''), destination_host: host, page_path: location.pathname });
      }
    }
  }
  function click(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    var anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!anchor) return;
    var target;
    try { target = new URL(anchor.href, location.href); } catch (_) { return; }
    var host = target.hostname, eventName;
    if (anchor.hasAttribute('data-tour-inquiry')) eventName = 'enquiry_start';
    else if (target.protocol === 'whatsapp:' || ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(host)) eventName = 'whatsapp_click';
    else if (/(^|\.)airbnb\.[a-z.]+$/.test(host)) eventName = target.pathname.includes('/users/') ? 'airbnb_profile_click' : 'airbnb_click';
    else if (host === 'booking.com' || host.endsWith('.booking.com')) eventName = 'booking_click';
    else if (host === 'egyptvillastours.com' && target.pathname === '/tours/luxor-solar-eclipse-2027-package' && location.pathname !== target.pathname) eventName = 'eclipse_package_click';
    if (eventName) track(eventName, host, context(anchor, eventName === 'enquiry_start' ? 'form_open' : 'direct_link'));
  }
  document.addEventListener('click', click, true);
  document.addEventListener('auxclick', click, true);
  document.addEventListener('royal-inquiry-outbound', function (event) {
    track('whatsapp_click', 'wa.me', context(null, 'form_handoff', event && event.detail && event.detail.tourName));
  });
})();
