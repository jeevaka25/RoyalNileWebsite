/* Explicit browser-only test exclusion; never infer staff from visitor attributes. */
(function () {
  var excluded = false;
  try {
    var mode = new URL(location.href).searchParams.get('analytics_test');
    if (mode === '1') localStorage.setItem('analytics_test', '1');
    if (mode === '0') localStorage.removeItem('analytics_test');
    excluded = localStorage.getItem('analytics_test') === '1';
  } catch (_) { excluded = /[?&]analytics_test=1(?:&|$)/.test(location.search); }
  window.siteAnalyticsExcluded = excluded;
  if (!excluded) return;
  window['ga-disable-G-12JHJ887DG'] = true;
  window['ga-disable-G-RWPKYR0C8J'] = true;
  window.fbq = function () {};
})();
