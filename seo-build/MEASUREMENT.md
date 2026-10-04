# Measurement and SEO maintenance — October 2026

## What an event means
- `whatsapp_click`: WhatsApp contact intent. It does not prove a sent message or received enquiry. GA4 key-event counting should be once per session; the raw event count remains useful for repeat-click diagnostics.
- `enquiry_start` (Royal Nile): the enquiry form opened. Not a lead.
- `airbnb_profile_click`: host-profile/trust visit. Never a booking.
- `airbnb_click` / `booking_click`: reservation-platform handoff. Not a completed booking.
- Existing Meta `Lead` campaign dispatch is preserved as an intent signal; it must not be reported as qualified enquiries.
- `qualify_lead` / `close_convert_lead` must come from verified business outcomes. There is no CRM or WhatsApp receipt integration in these sites, so the browser must not synthesize them.

Event dimensions: `content_id` identifies the authored page/tour; `cta_location` identifies the button section; `enquiry_mode` distinguishes direct_link, form_open and form_handoff. Egyptian Tours also supplies package_id where a package was selected. No message text, guest name, email, phone, travel dates or party size enters these parameters.

## Exclude staff and development visits
On each site, staff can open `/?analytics_test=1` once in their own browser to exclude subsequent visits from GA4 and Meta. This stores only a browser preference, not an IP or identity. Restore normal tracking with `/?analytics_test=0`. Do not enable this on guest devices. Different browsers/domains need their own preference. Existing historic test data is unchanged.

## Campaign convention
For new Meta links use lowercase source facebook or instagram, medium paid_social, a stable campaign name and a stable creative ID in utm_content. Example: `?utm_source=facebook&utm_medium=paid_social&utm_campaign=luxor_eclipse_2027&utm_content=terrace_video_01`. Organic posts use medium social. Do not rewrite historic reports or change active ad campaigns as a side effect of a site deployment.

## Lead outcome register
Record enquiry date, brand, package/page if known, channel, qualified yes/no and booked yes/no in the business lead log. A qualified enquiry means a real received request with travel intent that the team can quote; a booking means written confirmation/payment under the agreed terms. Avoid storing personal details in analytics.

## SEO release rules
Preserve canonical URLs and existing redirects. Update sitemap lastmod only when main content, structured data or meaningful links change. Egyptian Tours uses src/pageModified.json rather than today's build date; add a date for every new route. Royal Nile's published HTML is authoritative; do not run the obsolete generators to rebuild the visual design. Correct the explicit sitemap entry after an edit. Homepage schema passed Google's live Rich Results Test on 4 October; the prior Ahrefs warning was not reproduced.

## Authority development
Earn references through actual accommodation/tour partners, relevant travel publications and verified business listings. Prepare factual descriptions using current inclusions and genuine photographs. No generic paid-link packages, mass directory submissions or automatic disavow. No outreach messages or external listings were submitted by this implementation.
