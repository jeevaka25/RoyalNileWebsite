# French pages (November 2026)

French versions of the homepage, the apartments and tours collection pages, the eight apartment
pages, every tour page and the restaurant page, for the France Meta campaign. The travel guide and
Meet your hosts stay in English.

| French page | Built from |
| --- | --- |
| `/fr/` | `index.html` |
| `/fr/villas/` | `villas/index.html` |
| `/fr/villas/<apartment>` | `villas/<apartment>.html` |
| `/fr/tours/` | `tours/index.html` |
| `/fr/tours/<tour>` | `tours/<tour>.html` |
| `/fr/restaurant.html` | `restaurant.html` |

## How it works

The published English pages stay the master copy (the old `generate.js` templates predate the
September redesign and must not be used). `build-fr.js` reads each English page and writes its
French twin, changing only the words, links and page language. Design, photos, scripts and
tracking are therefore identical by construction.

- **Wording:** `catalog.js` (homepage and apartments), `catalog-tours.js` (tours) and
  `catalog-restaurant.js` (restaurant) hold every English wording beside its French wording.
- **Facts:** numbers (ratings, review counts, beds, bathrooms, guests, minutes, years) are read
  from the English page on every build, so a fact update is one edit to the English page plus a
  rebuild. A French wording without `{0}`-style placeholders is only reused while the English
  numbers are unchanged.
- **Reworded English:** the build stops and lists any English wording that has no French yet.
- **Links:** links to translated pages go to their `/fr/` versions; the travel guide and Meet your
  hosts go to the English pages. Travel guide links
  in running text say "(en anglais)". An `EN` link in the menu opens the English version.
- **WhatsApp:** every WhatsApp button opens with a French message. Booking.com and Airbnb links are
  unchanged. Meta Pixel `Lead` events fire exactly as on the English site (same
  `analytics-events.js`).
- **SEO:** `lang="fr"`, French titles and descriptions, self-canonical, `hreflang` fr/en/x-default
  on both language versions, French pages in `sitemap.xml`. Shared business entities in the
  structured data keep their English IDs and addresses.
- **Shared scripts:** `availability-search.js` and `redesign/redesign.js` choose French or English
  text and number style from `<html lang>`. The build refreshes their `?v=` hashes on every page.
- **Tour enquiry form:** builds a French WhatsApp message (date shown as dd/mm/yyyy); the same
  enquiry events fire.
- **Routing:** `.htaccess` serves `/fr/villas/<apartment>` and `/fr/tours/<tour>` like the English clean URLs;
  `vercel.json` gets matching preview rewrites.

## After changing an English page

```sh
python3 seo-build/seo-2026-10/<your script>.py   # or your usual edit
node seo-build/fr/build-fr.js                     # add any French it asks for to catalog.js
node seo-build/verify-fr.js
node seo-build/verify.js && node seo-build/verify-booking.js && node seo-build/verify-tour-migration.js && node seo-build/verify-pixel.js
```

`verify-fr.js` fails if a French page is out of date, has English left in it, shows different
numbers from its English page, links to an English version of a translated page, or has a
WhatsApp message that is not French. It also draws the homepage cards the way the browser does
and checks that every booking and WhatsApp link on them sends a Meta `Lead`.

Guest review quotes on the homepage are shown in their original English, with a French note.
The tour pop-up on the homepage only opens from old English tour links, so it is not translated.
Guide links in running text say "(en anglais)" because the travel guide is English only.
