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
  redirect with **302**. Plan: switch those redirects to **301** after a quiet week (reminder set for 2026-10-27;
  test with the clean-links suite first).
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

## 5. Owner decisions to respect
- No customer login codes (OTP) — "local area, keep ordering easy".
- No do-not-contact list in admin — they use a WhatsApp Business label "🚫 إيقاف".
- No discounts on the supermarket now (the offer strip can announce them later).
- Product count shows the real number (not a fixed "4000+").
- Skipped for now: photos for ~250 products without one, renaming the 49 products called only "ايسكريم".

## 6. Open items (ask before starting)
1. 2026-10-27: .htaccess redirects 302 → 301 (small; reminder set).
2. Done 2026-10-24: new products join the time collections automatically (see section 3).
3. BACKLOG.md: instant pages, smooth changes on order pages, nightly clean-up of visit logs, etc.
4. Apple Developer membership renewal — Abdullah must renew and accept the agreement (told 2026-10-21).
5. Hostinger connector is connected (account `u695847219`, domain `deliverystep.app`): it can list/read files and
   clear the cache. **Uploading** goes to `srv1508-files.hstgr.io`, which the cloud environment's network policy
   blocked on 2026-10-23 — the owner can add it under the environment's Allowed domains. The connector cannot
   delete or rename files. Keep "test → owner OK → upload → keep the old copy".
6. 2026-10-23: the main folder still has 15 Oct copies of cart, checkout, menu, restaurants, coffee, account, invite,
   marketproducts (+ `privacy-whatsapp-section.html`). The fixed `.htaccess` (uploaded by the owner, cache cleared)
   now serves `pages/` first, so they are unused; the owner may delete them in File Manager (main folder only).
