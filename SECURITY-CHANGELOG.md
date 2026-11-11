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

Added `privacy/index.html` (served at `/privacy/`), a footer link on all 65 pages, and a
`sitemap.xml` entry. Content drafted from the passive review; legal position on Article 27 is
recorded in the engagement notes (`art27-assessment.md`).

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
3. French version at `/fr/privacy/` — French footers currently point at the English page.
4. Re-read section 7 once the cookie banner ships; it currently says the tags run on load and
   promises consent gating.
5. Article 27: exemption relied on deliberately. See `art27-assessment.md` for the triggers
   that reverse it.
