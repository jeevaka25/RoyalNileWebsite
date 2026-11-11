/* Soft consent banner: measurement tags load immediately; Accept confirms, Reject stops them from then on.
   Choice is remembered and can be reopened from the "Cookie settings" footer link. */
(function () {
  var KEY = 'consent';
  var VERSION = '20261111';
  var lang = (document.documentElement.lang || 'en').slice(0, 2);

  var COPY = {
    en: {
      text: 'We use Google Analytics and the Meta pixel to measure visits and ad performance. You can accept or reject them \u2014 the site works either way.',
      accept: 'Accept',
      reject: 'Reject',
      more: 'Privacy policy',
      moreHref: '/privacy/',
      label: 'Cookie choices',
      saved: 'Choice saved.'
    },
    fr: {
      text: 'Nous utilisons Google Analytics et le pixel Meta pour mesurer les visites et la performance des annonces. Vous pouvez les accepter ou les refuser \u2014 le site fonctionne dans les deux cas.',
      accept: 'Accepter',
      reject: 'Refuser',
      more: 'Politique de confidentialit\u00e9',
      moreHref: '/fr/privacy/',
      label: 'Choix des cookies',
      saved: 'Choix enregistr\u00e9.'
    }
  };
  var c = COPY[lang] || COPY.en;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); localStorage.setItem(KEY + '_version', VERSION); } catch (e) {}
  }

  function stopTags() {
    window['ga-disable-G-12JHJ887DG'] = true;
    window['ga-disable-G-RWPKYR0C8J'] = true;
    if (typeof window.fbq === 'function') { try { window.fbq('consent', 'revoke'); } catch (e) {} }
    clearMeasurementCookies();
  }

  // A rejection stops future hits; expire what the tags already set so the browser does not keep carrying it.
  function clearMeasurementCookies() {
    var host = location.hostname.replace(/^www\./, '');
    var domains = ['', '; domain=.' + host, '; domain=' + host];
    document.cookie.split(';').forEach(function (pair) {
      var name = pair.split('=')[0].trim();
      if (!/^(_ga|_gid|_fbp|_fbc)/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; path=/' + d + '; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      });
    });
  }

  function close(el) {
    el.remove();
    var link = document.querySelector('[data-consent-open]');
    if (link) link.focus({ preventScroll: true });
  }

  function render() {
    if (document.querySelector('[data-consent-banner]')) return;
    var el = document.createElement('div');
    el.setAttribute('data-consent-banner', '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', c.label);
    el.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:680px;margin:0 auto;' +
      'background:var(--card,#fff);color:var(--text,#1f2a2c);border:1px solid var(--border,#e7e0d1);border-radius:14px;' +
      'padding:14px 16px;box-shadow:0 10px 30px rgba(31,42,44,.18);font-size:.9rem;line-height:1.5';
    el.innerHTML =
      '<p style="margin:0 0 10px">' + c.text + ' <a href="' + c.moreHref + '" style="color:var(--primary,#147481)">' + c.more + '</a></p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" data-consent="granted" style="flex:1 1 120px;cursor:pointer;font:inherit;font-weight:600;' +
      'padding:9px 14px;border-radius:9px;border:1px solid var(--primary,#147481);background:var(--primary,#147481);color:#fff">' + c.accept + '</button>' +
      '<button type="button" data-consent="refused" style="flex:1 1 120px;cursor:pointer;font:inherit;font-weight:600;' +
      'padding:9px 14px;border-radius:9px;border:1px solid var(--border,#e7e0d1);background:transparent;color:inherit">' + c.reject + '</button>' +
      '</div>';

    el.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-consent]');
      if (!btn) return;
      var v = btn.getAttribute('data-consent');
      write(v);
      if (v === 'refused') stopTags();
      close(el);
    });

    document.body.appendChild(el);
  }

  // Footer "Cookie settings" link reopens the banner.
  document.addEventListener('click', function (ev) {
    var open = ev.target.closest('[data-consent-open]');
    if (!open) return;
    ev.preventDefault();
    render();
    var first = document.querySelector('[data-consent]');
    if (first) first.focus({ preventScroll: true });
  });

  // Show on first visit only; never over a page that is still parsing.
  function init() {
    if (!read()) render();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
