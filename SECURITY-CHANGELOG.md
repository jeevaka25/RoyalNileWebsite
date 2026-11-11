# Security header changes — rollback record

Deployed by: Hermes Agent (profile `default`), for owner Jeevaka, https://egyptvillastours.com
Basis: owner-authorized passive review, engagement `~/pentest/engagement-20261110-122357`
Date that matters: 2026-11-10 (merge commit adds this file — use `git log` for the exact SHA)

**Everything is one `<IfModule mod_headers.c>` block in `.htaccess`.** Remove lines from that
block to roll back; the block sits with the pre-existing `nosniff` and `Referrer-Policy`
headers.

## What was added and how to remove each

| Header | Rollback action | Symptom that would prompt it |
|---|---|---|
| `Strict-Transport-Security` | delete the line | any subdomain or certificate becomes unreachable over HTTP; browsers refuse the bypass prompt |
| `X-Frame-Options` + `Content-Security-Policy: frame-ancestors` | delete both lines | a partner site needs to embed the site, or an in-app browser blanks the page |
| `Permissions-Policy` | delete the line | a permission prompt-dependent feature stops working |
| `Content-Security-Policy-Report-Only` | delete the line | console noise becomes unmanageable (reports only — it cannot break a page) |

## Fast full rollback

```bash
git revert <merge-commit-sha>   # or: delete the five `Header always set` lines added on 2026-11-10
```

Then re-deploy and confirm with:

```bash
curl -sSI https://egyptvillastours.com/ | grep -iE "strict-transport|x-frame|content-security|permissions-policy"
```

## Deliberate omissions — do not "fix" these

- **No `preload`** on HSTS. Adding it is slow to reverse; add only after months of clean service.
- **No `payment=()`** in Permissions-Policy, so Apple Pay / Google Pay remain available.
- **`'unsafe-inline'` stays in `script-src`.** The pages use inline `onclick`/`onsubmit`
  handlers; removing it without migrating them to listeners breaks every button.
- **No SRI / no version pinning** on the jsDelivr assets in this change set. Deliberately left
  out to avoid any cold-cache cost and any risk of the CDN serving mismatched bytes.
  `flatpickr` therefore stays unpinned and can change under you.

## Known caveats

- The CDN must pass origin headers through for any of this to take effect. `X-Content-Type-Options`
  and `Referrer-Policy` from the same block already reach clients, so it does — verify HSTS
  after deploy rather than assuming.
- `frame-ancestors 'self'` blocks third-party embedding on purpose. Widen with
  `frame-ancestors 'self' https://partner.example` if needed.
- Report-only CSP still permits inline script execution, so it is *not* XSS protection yet.
  Move the header name to `Content-Security-Policy` once the console stays clean for a week.

---

# Privacy policy page — 2026-11-10

Added `privacy/index.html` (served at `/privacy/`) and its French counterpart `fr/privacy/index.html`
(`/fr/privacy/`), footer links on all 66 pages in the right language, hreflang pairs both ways, and two
`sitemap.xml` entries. Legal position on Article 27 recorded in the engagement notes (`art27-assessment.md`).

## Rollback

```bash
git revert <merge-commit-sha>          # removes the page, the 65 footer links and the sitemap entry
```

Single-file rollback: delete `privacy/index.html` and the ` · <a href="/privacy/">…</a>` fragment
from the footer line of each page. The page is self-contained — it shares the site's CSS and nav
but nothing else links to it, so removing it cannot break another page.

## Before publishing — not yet done

1. `privacy@egyptvillastours.com` must forward to a monitored inbox.
2. Confirm the retention periods in section 4 match real practice.
3. French page shipped at `/fr/privacy/`; all 25 French footers relinked to it. Keep the two translations in
   step — an edit to one language must be mirrored or the pair diverges.
4. **Section 7 states the current truth: no banner, tags run on load, a banner is being prepared.** When one lands,
   rewrite the section to describe what was actually built — a promise is a claim.
5. Article 27: exemption relied on deliberately. See `art27-assessment.md` for the triggers
   that reverse it.

---

# Cookie banner — built 2026-11-11, rolled back the same day

There is **no banner** and no consent JS on the site right now. Status quo restored: GA4 and the Meta pixel fire on every
load, untouched, because the Meta conversion campaigns optimise on the Lead event fired by `analytics-events.js` and the
owner does not want that signal degraded while the approach is researched.

Superseded commits: `719e682` (banner), `f4f3617` (cache bump), `ae50294` (cookie expiry on refusal). All three reverted in
one commit; `consent-banner.js` is gone, the `data-consent-open` footer links are gone, and `analytics-preferences.js` is
back to its staff-test-exclusion form.

## What was learned while it was live (reuse on the next attempt)

- Caching bites: changing `analytics-preferences.js` without bumping its `?v=` meant browsers kept serving the old file and
  a stored refusal did nothing. Bump the query on any script edit that ships.
- Disabling a tag does not remove cookies already written; they must be expired explicitly.
- With the pixel stubbed out, `fbq('track','Lead')` still *fires* but reaches nothing — and the pixel script does not load
  on refused pages at all. That is the mechanism behind the lead-signal loss.
- `airbnb_profile_click` does not fire `Lead`; only `airbnb_click` (listing links), `booking_click` and `whatsapp_click` do.
  Profile links are a decoy when testing.
- Nothing in `?v=` survives a revert either — the original values come back with it.

## Options considered and not taken yet

B (soft banner) is what was rolled back. C would gate the tags with Consent Mode v2 modelling. D would restore leads
server-side via Conversions API with `fbclid` + `event_id`, independent of browser consent. D needs dedupe before it ships,
or the pixel and the server event double-count and the optimiser learns something false.
