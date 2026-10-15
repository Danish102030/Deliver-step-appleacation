# Saved ideas (for later)

Ideas the owner approved in principle but asked to keep for a future session.

## 1. Instant pages — no more grey loading boxes
- **Pages:** restaurants, coffee, supermarket (categories), menu (a restaurant's dishes).
- **Today:** every visit shows grey placeholder boxes for 0.5–2 s while the page asks the database, then the cards pop in.
- **Plan:** like the new home page (`ds_home_v2`):
  - show the last saved copy instantly (localStorage), then refresh from the database in the background and update quietly if something changed;
  - open / closed is still worked out from the opening hours, so it stays correct;
  - prices in the cart and at checkout still come from the database.
- **Tests to run:** weak internet, no internet, first visit, a shop closing, a price change.

## 2. Smooth page changes on the order pages
- order-tracking.html and order-confirmed.html need the same one-line `ds-smooth-1` addition (they are not in this repo — ask the owner for the latest copies).

## 3. Same bottom menu + smooth changes on other pages
- pharmacy, buffets, and any other page with a bottom menu: add `ds-lib/ds-nav-1.js` (after the menu) and `ds-smooth-1` (in the head). Ask the owner for the files.

## 4. Website block for visitors outside Saudi Arabia (built, switched OFF)
- Built and tested (15 checks): `website/ds-lib/ds-geo-1.js`, loaded by every page; admin switch in Settings → Orders & payments.
- Owner chose to skip it for now (2026-10-15): the database setting `geo_block` is `{"on":false}`, so nothing is blocked even if these page files are uploaded.
- To use it later: upload `ds-lib/ds-geo-1.js` + the pages + admin.html, then tick the switch in the admin.
- Decided NOT to limit the App Store / Google Play to Saudi Arabia (expats with foreign store accounts couldn't download the app).

## 5. Nightly clean-up of visit records (small, not urgent)
- page_views / visit_live / visit_days grow by a few thousand rows a day. A nightly job should delete page_views older than 180 days, visit_live older than 1 day, visit_days older than ~400 days.
- Not added yet: statements with DELETE need the owner's confirmation in the database tool (it timed out). Add `public.clean_visit_logs()` + a pg_cron job when the owner can approve.
