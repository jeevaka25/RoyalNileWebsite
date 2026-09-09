# September 2026 SEO maintenance

These changes preserve the published static redesign. The old generate.js and generate-travel-guide.js templates predate that design: do not use them to regenerate production pages.

After editing the approved content, run `python3 seo-build/seo-2026-09/tuneup.py`, then `node seo-build/seo-2026-09/prerender.cjs`. The latter reuses the actual homepage card renderers. All eight apartments and ten tours are available in the initial HTML; the existing client-side randomization remains active.

Maintain host/listing evidence in `trust-data.json`. It records the actual verification date, not the deployment date. Check the linked Airbnb profile and individual listings before increasing counts. Keep villa-data.js ratings synchronized and copy the same verified host snapshot to the sister site's src/hostTrust.json. Never use the host-wide rating as an individual apartment rating. No imported Product or aggregate-review markup is emitted.

Apartment facts come from the existing public inventory. Floor measurements, step-free access dimensions and new cancellation promises must be verified with the property operator before publication. The original-image manifest records the source listing photographs for Nile View Apartments 1 and 2; pool/garden photos are shared-property amenities.

Validate with `node seo-build/verify.js`, `node seo-build/verify-booking.js`, and `node seo-build/verify-pixel.js`. Retain all 35 canonical routes. After deployment, check the actual public site and versioned assets; a successful preview build alone is insufficient.

Measurement: Airbnb, Booking.com and WhatsApp clicks and enquiry starts are intent signals. Confirmed reservations and qualified conversations must be recorded separately. Compare monthly GSC commercial landing-page clicks and GA intent events with the previous equivalent period; do not interpret all guide traffic as booking demand. Never send visitor form values or WhatsApp message text to analytics.
