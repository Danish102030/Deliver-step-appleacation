# Saved ideas (for later)

Ideas the owner approved in principle but asked to keep for a future session.

## 1. Instant pages — no more grey loading boxes
- **Done 16 Nov for home, restaurants, coffee, buffet (+ menu header)** — see HANDOVER "No more flashing". Left: supermarket categories, menu dishes.
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

## Parked 15 Nov 2026 — "team-style" project hygiene (owner: "parked this now")
Recommended order (docs / file moves only, live app unchanged, through a PR):
1. **KEYS.md** — map of every key/secret: purpose, where stored, who sees it, how to rotate (never the values).
   Known to fix: an old Mapbox key still in old git files (`www/`, root `checkout.html` — old rider app) → remove from
   code and rotate in Mapbox; `capacitorinit.js` (server) uses an older public key → check.
2. **API.md** — every database function the apps call (place_order, my_orders, track_order, rider_*, …): what it does,
   inputs, who may call it. Makes a future native app (Flutter/Swift) easy: same backend.
3. Folder tidy-up — old rider-app files (root *.html, `www/`) → `legacy/`; keep website/, supabase/, ios/, brand/, docs/.
4. Owner: 2-step login on GitHub, Hostinger, Supabase, Apple, Meta; protect `main`; GitHub secret scanning on.
5. Later: a test (staging) database for risky changes.
