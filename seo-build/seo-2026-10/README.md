# October 2026 SEO audit follow-up

`apply.py` makes targeted, idempotent string edits to the published static HTML. It does not
re-serialise pages, so unrelated markup stays byte-for-byte unchanged. Run from the repository root:

    python3 seo-build/seo-2026-10/apply.py
    node seo-build/seo-2026-09/prerender.cjs

Inputs: `content.json` (titles, descriptions, alt text, gallery captions, eclipse anchors) and
`tour-depth.json` (extra copy and FAQs for the Abydos & Dendera, Abu Simbel and sunset Nile cruise pages).

What it changes:
- Titles: homepage brand-first with "Villas in Luxor"; /villas/ leads with "Luxor Villas"; eclipse
  local-times and where-to-stay guides target "where to watch" and "hotels" searches.
- Homepage tour cards for the two Cairo tours (fixes the long-standing verify.js homepage-link failure).
- Eclipse package links back to all three eclipse guides; one consistent package anchor.
- Deeper tour pages, links from the private-tour and eclipse itinerary guides.
- Gallery captions and alt text that describe each photo; alt text for hero and collection-card images.
- 960 px card copies in `optimized-assets/cards/` for collection, related and homepage tour cards.
- Homepage schema: address on the Egyptian Tours TravelAgency, image/phone/geo on LodgingBusiness.
- width/height on fixed-height card images; sitemap lastmod for meaningfully changed pages.

Server config (edited by hand): `.htaccess` and `vercel.json` gain redirects for old URLs with a close
current equivalent, `/wonders-of-cairo-tour/` now 301s to the Cairo tour, and cache lifetimes are 30 days
for images/video/fonts and 7 days for CSS/JS. Replaced images must use new file names; bump `?v=` (or
rename) when changing an unversioned stylesheet or script.

`seo-2026-09/tuneup.py` mirrors the new title/schema values but re-serialises every page and reverts
later dated copy, so prefer targeted scripts like this one.

Checks updated for known stale expectations: tour collection card count, sitemap page count, canonical
and og:url attribute order, and the old booking-dock comment marker.
