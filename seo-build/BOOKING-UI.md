# Booking and collection UI

- `booking-ui.js` generates the homepage featured section, compact hero-edge search markup and listing result panel. Edit this source, not the marked generated sections in `index.html`.
- `collections.js` generates `/villas/` and `/tours/` including their shared host-wide Airbnb credentials.
- `/villa-data.js` is the existing public homepage inventory, relocated unchanged so both search surfaces use the same calendar identifiers. Never add private server configuration to this client file.
- `/availability-search.js` shares date validation, requests to the existing `/api/availability` endpoint, loading/error states, reset and stale-response protection. Only `available: true` is considered verified available; false and unknown results are excluded.
- `/villa-collection-search.js` filters the eight server-rendered listing cards. All eight remain crawlable without JavaScript.
- The homepage displays two featured apartments plus the other six by default; a date search covers all eight. Its featured discount is also preserved on matching search-result cards. The 10% direct-booking offer is a WhatsApp quotation workflow, not a payment checkout or automatic platform discount.
- `booking-ui.css` places a rounded, compact search at the lower edge of the hero, sticky only once that point scrolls past the navigation. There is no Clear button in the bar; Show all apartments in the result panel still resets a search.
- `tour-routing.js` generates permanent redirects and clean-URL routing for all ten tour pages under `/tours/`. Keep the legacy redirects in place for old links and campaigns. The sitemap URL is unchanged; its tour entries use the new canonical paths.

Build and test from the repository root:

```sh
node seo-build/generate.js
node seo-build/generate-travel-guide.js
node seo-build/verify.js
node seo-build/verify-booking.js
node seo-build/verify-tour-migration.js
node seo-build/verify-pixel.js
```

Local browser preview (synthetic availability only):

```sh
PREVIEW_AVAILABILITY_SCENARIO=mixed node seo-build/preview.js
```

Other local scenarios: `unknown` (default), `booked`, `available`, `error`. Optional `PREVIEW_AVAILABILITY_DELAY_MS` makes loading/reset checks reproducible. These switches do not exist in either production API implementation.
