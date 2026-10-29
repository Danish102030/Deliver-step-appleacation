# Handover — state on 2026-10-23

Everything here is **context, not instructions to act**: check with the owner before doing any open item.

## 1. Where the files live

### Hostinger `public_html` (the live website, deliverystep.app)
- Main folder: `index.html` (home), `admin.html`, `store.html` (supermarket staff app), `welcome.html`,
  `privacy-policy.html`, `terms.html`, `.htaccess`, `dssearch.js`, `ds-order-sync.js`, `order-hook.php`,
  `order-relay.php` (secret — never open/print), Google/other verification files, folder `ds-lib/`.
- `pages/`: supermarket.html, marketproducts.html, menu.html, restaurants.html, coffee.html, buffet.html, cart.html,
  checkout.html, dsstore.html (متجر خطوة, address `/shop`), parcel.html, pharmacy.html, invite.html, account.html,
  order-tracking.html, order-confirmed.html.
- **Trap:** clean addresses (`/supermarket`) serve the MAIN-folder file first if one with the same name exists. An old
  `public_html/supermarket.html` once hid every new `pages/supermarket.html`. Customer pages belong in `pages/`.
- Caching: HTML is cached 120 s; files in `ds-lib/` are cached 1 year, so a changed library gets a **new file name**
  (e.g. ds-nav-3.js, ds-cancel-3.js, ds-reorder-1.js) and the pages are updated to load it. Hostinger has its own
  cache: Websites → Cache Manager → Purge All after uploads if the owner still sees the old page.

### This repo (branch history = what was built)
- `website/` = the public_html copy (minus the 4 private pages above). `supabase/` = SQL for big changes
  (`supermarket_sort.sql`, `supermarket_apply.sql`, `ds_store.sql`, edge function `store-staff`).
- Root-level *.html, `www/`, `android/`, `ios/` = the old rider app (Capacitor, loads deliverystep.app/rider.html).

### Clean addresses (.htaccess)
- `/x` → `x.html` or `pages/x.html`; `/category/<slug>` → marketproducts; `/shop` → dsstore; old `.html` addresses
  redirect with **302**. A tested 301 version is in commit f747fcb — the owner chose to skip it (27 Oct, «not important»).
- Security headers + blocking of hidden/backup files are in the same .htaccess.

## 2. How to test (local copy)
- Apache: `apt` Apache serving a copy at `/var/www/dstest`, port **8088** (vhost `dstest.conf`, `apachectl -k start`
  after a container restart). Copy `website/` + the private pages there. curl needs `--noproxy '*'`.
- Playwright with the preinstalled Chromium (`/opt/pw-browsers/chromium-*/chrome-linux/chrome`, launch arg
  `--no-proxy-server`); mock every `*.supabase.co` request with `context.route` (the real site and Supabase are not
  reachable from the sandbox — do not try to route around that).
- Database changes: test with a DO block that ends in `raise exception 'TEST (rolled back)'`.

## 3. Database (Supabase) — things to know
- Customer privacy: orders, order_items, customers, riders, rider_locations, device_tokens are **closed to the
  public**; pages use RPCs (`my_orders`, `ds_find_recent_order`, rider RPCs). Don't reopen tables.
- Admin login needs the 2-step code (`is_admin()` requires `aal2` once a code is set up).
- `settings` table (public read, admin write) drives the customer pages. Supermarket keys:
  `supermarket_delivery_fee` 5, `supermarket_free_delivery_min` 70, `supermarket_discount_min` 50,
  `supermarket_discount_fee` 3.5, min/max order, `two_vendor_delivery_fee`, and **`sm_strip`** (JSON for the offer
  strip: `{free,tier,speed,extra:[{on,emoji,text,color,cat,until}]}` — edited in Admin → Settings → Delivery fees).
- Supermarket catalogue (re-sorted 2026-10-22, owner approved):
  - `supermarket_categories`: **18 sections** (parent_name null) with **75 sub-sections** (parent_name = section).
    Products sit in a sub-section (ice cream: directly in the section آيسكريم). Retired shelves الصافي / جالكسي /
    ركن الكشتات are hidden rows pointing to their new section (old links still work).
  - `supermarket_products.collections text[]`: the 6 time collections الفطور, طبخ الغداء, عشاء خفيف,
    حلا وشوكولاتة, كشتة وشواء, آيسكريم وبارد. Pages: `/category/breakfast|lunch|dinner|sweets|kashta|cold`
    (these slugs are reserved by a check constraint).
  - Sorting rules + backups in the private schema `ds_work` (`sm_rules`, `sm_coll`, `sm_bak_cat_20261022`,
    `sm_bak_prod_20261022` = the old layout, for undo).
  - **Auto collections** (2026-10-24, owner approved): trigger `trg_sm_products_auto_coll` gives a new or moved
    product its collections from `ds_work.sm_coll` (keeps hand-added ones). To change which shelves go in a collection,
    edit `ds_work.sm_coll`. SQL: `supabase/supermarket_auto_collections.sql`.
  - RPCs: `sm_popular` (product popularity), `sm_home` (front-page data; currently unused by the live page).
- Rider alerts: dead rider phone tokens are switched off nightly (`ds_rider_tokens_tidy`, cron 23:35); last check
  showed 7 phones reached / 1 failed per order.

## 4. Current customer-facing state (approved by the owner)
- **Supermarket page** = the OLD design (big category picture grid, sub-sections open inside the page, one back
  arrow) **plus**: title line with the real product count in English digits, a slim offer strip (swipe; slides from
  `sm_strip`), and a banner that changes with the time of day and opens the matching time collection.
  The owner tried and **rejected** the new layout with a side menu — don't bring it back.
  No-flash fix (2026-10-23, owner confirmed): each opened section keeps its own grid in `#sub-grids` (switching only
  hides/shows grids, pictures never reload); the strip + banner stay visible in the section view (hiding them made the
  list jump). Test: scratchpad `step89/flash2.js` style frame recorder.
- Category page (marketproducts) = old 3-column grid; a whole section shows all its sub-sections' products.
- "🔁 اطلب مرة ثانية" (order again): only on **delivered** orders, only in طلباتي panel + account page (home kept clean).
- WhatsApp consent lines under every WhatsApp button + under the checkout button; privacy policy has a WhatsApp
  section; `/terms` page exists (footer, checkout line, account row).
- متجر خطوة (own shop, `/shop`): recharge-card photo option (transfer first, small fee, no delivery fee).
- متجر خطوة gift cards (2026-10-24, owner approved the card design): Admin → My store → Departments → type
  "🎮 Gift card brand" (column `gift`) + brand picture, card title, bar word, colour. Packs = products named with the
  number ("530 جوهرة"). Customer page: one "بطاقات وألعاب" button, brand tiles, packs drawn like the Free Fire card
  (our name instead of the supplier logo, no game artwork), code on WhatsApp, bank transfer first, no rider.
  2026-10-25: optional **Card picture** per brand (`card_image`, e.g. the MAS Free Fire card): Admin cuts the black
  border off by itself; every pack shows the whole card with a light tilt (owner chose option A), 💎 left + "Diamonds 530"
  on the card's bottom bar. "Use drawn card" goes back to the drawn design.

- متجر خطوة recharge (2026-10-25, owner approved): company tiles first (logo = department picture), then the amounts
  drawn as cards (or the company's real card picture). One department per company, type Recharge, products "شحن 20";
  the old mixed department ("شحن STC 20", "شحن زين 30") still works and is split by the names. Cart lines always name the
  company / brand ("ليبارا · شحن 20"). Admin sales-by-company counts any company.
- Admin → My store → Departments (2026-10-25): 3 boxes — 📶 Recharge cards (one row per company), 🎮 Gift cards & games
  (one row per brand), 🛍️ Other departments; each box has its own Add button; ▲▼ move inside the box; the product form
  groups departments the same way and says how to name the product. Data tidied 2026-10-25 (owner asked): Free Fire packs
  moved into فري فاير (gift), موبيلي 20 into موبايلي, شحن رصيد renamed stc; backup ds_work.dsstore_*_bak_20261025.
- Admin Dashboard → **🎁 Free deliveries** (2026-10-25): loyalty-card orders (`loyalty_free`) + friend's first order
  (`ref_code`), this month / last month / 7 days, fees not charged (estimate), warning + link when a friend order was
  not really a first order. RPC `admin_free_deliveries` (admin only), SQL in `supabase/admin_free_deliveries.sql`.

- 2026-10-26 (all tested, committed): متجر خطوة — customer picks a company / gift brand first, then only that one shows
  («↺ شركة أخرى / لعبة أخرى»); gaming brands without packs show greyed «قريباً»; Admin brand/company rows list their
  packs with «+ Add pack / + Add amount». Card photo checkout: card price + separate «رسوم الخدمة» line + 0.50 (owner
  wants the 0.50 kept) → stc 23 = 24.50; order saved as 2 lines; store sales log books the fee as income (no cost).
  Gift brands in DB: بلايستيشن, فري فاير, إكس بوكس, آبل ستور, قوقل بلاي (backup ds_work.dsstore_deps_bak_20261026).
- **invoice.html** (main folder, now in git as website/invoice.html): reads orders with the Admin login saved in the
  browser (orders are private since the privacy step — it showed «no invoices»). Owner to upload it (sent 26 Oct).
- Last zip sent for the store: deliverystep-gaming-2.zip (admin.html + pages/dsstore.html + pages/checkout.html).
  After uploads: clear Hostinger cache (connector reconnected 26 Oct → new session needed to use it).

- **Loyalty reminders** (2026-10-27, owner approved): app push when a customer is 9 of 10, just earned the free
  delivery, or has it unused 7 days. Max 1 a week per customer, 12–21 Saudi time, hourly job `loyalty-reminders`
  (:07) → `send_loyalty_reminders()`; log `loyalty_reminder_log`; texts + on/off in settings `loyalty_reminders`;
  taps via push_notifications rows target `loyalty_*` (ids 55–57) + notif_clicks; «ordered» = order within 3 days.
  Admin → Marketing → Loyalty reminders (numbers, edit texts, send now, waiting list with WhatsApp for web-only
  customers). Customers are reached via the device_token on their latest order. First send 27 Oct: 9 delivered.

- **Admin clean-up** (2026-10-28, owner asked): pages **Coupons, Home services, Announcement, Reports** removed from
  admin.html (menu, phone "More" menu, Marketing tabs/cards, their code) → 720 KB → 687 KB. Data untouched (coupons
  table, SRV- orders, settings.home_notice — not set, so no announcement shows). The checkout code box still works for
  invite codes. Home-service bookings still go to WhatsApp; the «خدمات منزلية» tile is still on the customer home page
  (offered to remove it). File: scratchpad step102 (zip deliverystep-admin-clean.zip, includes Loyalty reminders page).
  Old `#coupons` bookmarks fall back to Dashboard.
  **Bug in that first upload (fixed same day, zip deliverystep-admin-fix.zip, 687108 bytes):** `initApp()` still wrote
  the removed `#report-date`, threw, and skipped everything after it (order load at start, customer order counts → every
  customer showed «🆕 عميل جديد», riders, live new-order listener + sound, 30 s poll, stale orders). Lesson: when removing
  a page, search for every id it had; the test now checks the customer-count RPC is called after login.
- **Admin menu 7 → 5 groups** (2026-10-28, owner approved): Today (Dashboard, Orders, Live tracking) · Shops (Restaurants,
  Dish options, Pharmacies, My store) · Supermarket · Grow (Marketing, Reviews) · Team & money (Riders, VAT, Settings).
  Phone "More" uses the same names. Same page ids. Zip deliverystep-admin-menu.zip (686827 bytes, scratchpad step103).
- **Admin split, step 1** (2026-10-28, owner said "start"): My store (its CSS, screen, product window and code) moved
  out of admin.html into `website/ds-lib/admin-mystore-1.js` (in git — no secrets). admin.html keeps an empty
  `#section-dsstore` + the `.dss-ar` style (Loyalty uses it) and a small loader `_lazy(key, box, then)` with the file
  list `_LAZY`; `goSection('dsstore')` fetches the file the first time, then reuses it. Failure → message, next tap
  retries. admin.html 687 KB → 597 KB. ds-lib is cached 1 year → **every change = new number** (-2.js) + update `_LAZY`.
  Tests: all earlier My store tests (step64/91/92/96/97/99) pass unchanged; step104/split_test.js. Upload order: the
  ds-lib file first, then admin.html. Next pages to move: Marketing (~60 KB), Settings (~30 KB) — one per step. Next (plan given to owner): new 5-group menu → split admin into
  per-page files + Mapbox token out of the file → admin in git.

- **Customer order details VAT line** (2026-10-28, customer complaint): orders are saved right (total = items +
  delivery + 0.50 − discount; there is no VAT column, the 0.50 is total − subtotal − delivery_fee + discount), but
  pages/order-tracking.html added items + delivery itself (showed 31.00 for a 31.50 order) and, before the order was
  found, showed a made-up «التوصيل 5.50». Fixed: shows «ضريبة القيمة المضافة 0.50» and the saved total; before the
  order is found only the items. pages/account.html inline details (orders without a number) got the same line
  (my_orders has no discount → a negative difference shows as «الخصم»). Zip deliverystep-order-vat-fix.zip (step105).

- **Old-app coupon KSA94** (2026-10-28): coupon is off in the database, but very old app copies have «KSA94 = 10 SAR
  off» written inside them (root checkout.html / www/checkout.html, 4-digit DS-xxxx numbers) and never ask the
  database. Only one customer (phone …1982) still does it (DS-1334, DS-870699, DS-735122, DS-6627). A database guard
  (hold + warning note, mockup in scratchpad step106) was offered; **owner said no** — he will talk to the customer.

- **Supermarket order saved under a restaurant** (2026-10-29, DS-903706 Nutella → «فلافل الشام»): `qibah_restaurant`
  stayed in the browser after a menu was only opened; supermarket items then added (e.g. from the search, dssearch.js)
  → checkout used that restaurant's name, WhatsApp and delivery fee. ~9 orders 15–29 Oct (supermarket items, order
  vendor = a restaurant). Fix in pages/checkout.html + pages/cart.html (top of the main script): the cart items decide —
  the saved restaurant is forgotten when none of its items is in the cart. Test step108/vendor_test.js (live copy fails 3/7).
- Admin order items panel: «Delivery fee» now the saved fee + a «VAT 0.50» line (+ «Discount»), was total − items
  (= «Delivery fee 5.50»); coupon card line «Before discount» (was «Subtotal» = items + delivery). Zip
  deliverystep-vendor-vat-fix.zip (admin.html 597868 + pages/checkout.html + pages/cart.html), scratchpad step108.

- **Auto-update from GitHub** (2026-10-29, owner said "yes setup"; built 7 Oct and undone then): see WEBSITE.md.
  Change in `website/` → pull request → owner taps Merge → only changed files go to Hostinger over FTP, old copies kept
  as a run artifact. Needs the owner's 3 FTP secrets in GitHub (never ask for them). The first merge uploads nothing.
  Script tested against a local FTP server (scratchpad step109). admin.html + account/order pages stay manual.
  29 Oct: secrets added, PR #3 merged. Its run tried 37 files (main already had the 7 Oct workflow, so the "first
  install" rule missed) but stopped before uploading anything. Fixed on the branch: the FTP login sees all 8 sites of
  the account and starts in /public_html (old rider-app.apk), so the site folder is fixed to
  /domains/deliverystep.app/public_html (must hold index.html, pages/, ds-lib/, admin.html); automatic runs refuse
  more than 12 files; `--check` looks only. Real test: website/terms.html (identical) uploaded OK, backup artifact kept.
  Never re-run run #2 (the failed 37-file one).

- **New phones could not register for notifications 21–29 Oct** (fixed 29 Oct, owner OK): the iPhone app saves its
  token with an upsert (`Prefer: resolution=merge-duplicates`); since the privacy step the SELECT policy is `false`,
  and Postgres checks SELECT policies on an upsert's new row → every NEW token got 401 (old ones kept refreshing via
  device_tokens_dedupe). Fix: the dedupe trigger sets `ds.tok_ins` = the token being saved; policy «app saves its own
  new token» lets only that row pass. Phones still read nothing. 22 missed phones (token on their orders) added back
  → 555 customer phones. SQL `supabase/device_tokens_new_phones.sql`. Lesson: after closing a table, test the app's
  exact request (upsert), not only a plain insert.

- Admin Dashboard → 🎁 Free deliveries: + **Today / Yesterday** (Saudi day) in the period list (2026-10-29, owner
  asked); `admin_free_deliveries` takes 'today' / 'yesterday'. Opens on "This month" as before. admin.html 597957
  (scratchpad step110, zip deliverystep-admin-freedel-days.zip).

- **Admin + account/order pages in git** (2026-10-29, owner asked "make admin automatic"): the Mapbox keys moved out of
  admin.html, pages/order-tracking.html and pages/checkout.html into `public_html/map-key.js` (server only, git-ignored;
  checkout uses a second key). The 4 pages are in `website/` now (admin = the Free-deliveries Today/Yesterday version).
  Done 29 Oct: PR #5 merged (run #7 uploaded the 5 pages), map-key.js uploaded (453 bytes, public_html). Still to do:
  restrict both Mapbox keys to deliverystep.app in the Mapbox account.

- **Home services removed from the customer home page** (2026-10-29, owner approved the mockup): the «خدمات منزلية»
  tile is now «📱 متجر خطوة» → /shop, and all its code (list sheet, booking sheet, confirmation, CSS, JS) is gone
  (index.html −15 KB). Old SRV- orders stay in the database and still show in طلباتي. First change shipped by Merge.
  Then (owner approved option B): the tile is named «شحن وبطاقات» and shows brand cards taking turns every 2 s
  (stc → mobily → zain → 🎮 PS → 💎 FF), CSS only (`.ds-rot`, ~1.4 KB), still card with reduced motion.

## 5. Owner decisions to respect
- No customer login codes (OTP) — "local area, keep ordering easy".
- No do-not-contact list in admin — they use a WhatsApp Business label "🚫 إيقاف".
- No discounts on the supermarket now (the offer strip can announce them later).
- Product count shows the real number (not a fixed "4000+").
- Maps: keep Mapbox (owner, 29 Oct). No extra location step at checkout: riders know the customers' homes / use the
  WhatsApp location (~20% of orders have no GPS — that is fine for the owner).
- Skipped for now: photos for ~250 products without one, renaming the 49 products called only "ايسكريم".

## 6. Open items (ask before starting)
1. Skipped by the owner 2026-10-27: .htaccess 302 → 301 (tested version in commit f747fcb if ever wanted).
2. Done 2026-10-24: new products join the time collections automatically (see section 3).
3. BACKLOG.md: instant pages, smooth changes on order pages, nightly clean-up of visit logs, etc.
4. Apple Developer membership: renewed by Abdullah's login on 2026-10-28 (US$99, «processing», activation email to
   the Account Holder's email within 2 business days). Next: transfer the Account Holder role to Ihsanullah (already
   Admin in App Store Connect; Apple Developer app on his iPhone; ID check) — started via Membership details →
   Update your information → Transfer Account Holder role. A support message was prepared/sent as backup.
   Then: iPhone app name ios/DeliveryStep/Info.plist CFBundleDisplayName "خطوة" → "خطوة التوصيل"; owner has a
   Windows laptop only → build/upload the iPhone app with Codemagic (cloud Mac) + App Store Connect API key.
5. Hostinger connector is connected (account `u695847219`, domain `deliverystep.app`): it can list/read files and
   clear the cache. **Uploading** goes to `srv1508-files.hstgr.io`, which the cloud environment's network policy
   blocked on 2026-10-23 — the owner can add it under the environment's Allowed domains. The connector cannot
   delete or rename files. Keep "test → owner OK → upload → keep the old copy".
6. 2026-10-23: the main folder still has 15 Oct copies of cart, checkout, menu, restaurants, coffee, account, invite,
   marketproducts (+ `privacy-whatsapp-section.html`). The fixed `.htaccess` (uploaded by the owner, cache cleared)
   now serves `pages/` first, so they are unused; the owner may delete them in File Manager (main folder only).
