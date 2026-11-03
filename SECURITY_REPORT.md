# Security hardening report — Delivery Step customer app + rider app

**Date:** 3 November 2026 · **Supabase project:** `vjuhxpttssmyomqqomdx` · **Prepared for:** sharing with other AI
projects that work on the same business (e.g. the CRM / WhatsApp project, which uses the same Supabase project).
No secrets, keys, tokens or customer phone numbers are included in this report.

## 1. Scope and boundaries

- **In scope:** customer website/app `deliverystep.app` (static HTML/JS on Hostinger, iPhone app = WKWebView of the
  site), rider app (Android Capacitor app that loads `deliverystep.app/rider.html`), the customer-app admin panel
  (`deliverystep.app/admin`), and their database objects in Supabase project `vjuhxpttssmyomqqomdx`.
- **Out of scope / not touched:**
  - **DS Software admin** (`ds.deliverystep.app`) — it uses a **different Supabase project** (`zbbuoxzgadspiuxqlext`).
  - **CRM + WhatsApp system** — every table/function named `crm_*` or `wa_*`, Edge Functions `whatsapp-*` / `wa-*`,
    and the cron job `wa-outbox-retry`. These live in the same Supabase project but belong to another project and
    were **not read, changed or tested** (beyond noticing they exist).
- **Method:** owner approval before every change; each database change was first run in a **rolled-back test**
  (transaction ending in `raise exception`), then applied as a named migration, then verified. Every change has an
  undo file in the repo (`supabase/security_step_*_rollback.sql`).

## 2. Already safe before this work (from an earlier audit, re-checked)

- `orders`, `order_items`, `customers`, `riders`, `rider_locations`, `device_tokens`: **closed to the public**
  (anon cannot read; pages use SECURITY DEFINER RPCs). `device_tokens`: anon may insert its own token only.
- Rider functions (`rider_*`, incl. `rider_duty_start/end/current/stats`) require a **rider session token**.
- Admin functions check `is_admin()`; admin login uses 2-step verification (TOTP, `aal2`).
- All RPCs reviewed are `SECURITY DEFINER` with a fixed `search_path`; owner `postgres` (bypasses RLS).

## 3. Step A — usage audit (read-only)

Sources: all code in git (`website/`), server-only files on Hostinger (`rider.html`, `stock.html`, `ds-order-sync.js`,
`capacitorinit.js`, `diag.html`, `push-test.html`, extra `ds-lib/*.js`; `.php` files were deliberately not opened),
the database catalog, and the Supabase API edge logs (logs are kept ~7 days; 2 full days analysed in detail).

| Object | Used by | Calls/day (approx.) |
|---|---|---|
| `my_orders(p_phone)` | customer site (home, nav, reorder, account) | ~480 |
| `track_order(p_order_number, p_phone)` | order tracking page | ~260 |
| `loyalty_status(p_phone)` | checkout, account | ~125 |
| `referral_balance(p_phone)` | checkout | ~70 |
| `save_my_profile(p_phone, …)` | account | ~10 |
| `referral_me(p_phone)` | invite page | ~3 |
| `customer_cancel_info` / `customer_cancel_order` | `ds-lib/ds-cancel-3.js` | 1–2 |
| `delete_my_account(p_phone)` | account | ~1 |
| `sync_customer_points`, `sync_order_count` | **nothing** | 0 |
| `rider_duty_*` | rider app | ~130 |
| table `duty_shifts` | **only the admin panel (logged in)**; no public use | ~15 |
| table `notif_clicks` | admin reads; writes go through `increment_notif_click()` | ~3 |
| table `page_visits` | customer site inserts; admin reads | ~350 inserts |
| storage `door-photos` | checkout (door photo), pharmacy (prescription photos `rx-…`), parcel; links are sent inside the WhatsApp order message; prescription links also in `order_items.product_image_url` | ~13 uploads |

## 4. Findings

| # | Finding | Severity | Status |
|---|---|---|---|
| F1 | Customer RPCs trust **only a phone number** (`delete_my_account`, `my_orders`, `save_my_profile`, `track_order` (returns address + GPS), `customer_cancel_*`, loyalty/referral) | High–Medium | **Open by owner decision** (see §6) |
| F2 | `duty_shifts`: public read/insert/update policies (193 shifts readable by anyone) | Medium | **Fixed (Step B)** |
| F3 | `notif_clicks`: public read/write policy (228 rows) | Low | **Fixed (Step B)** |
| F4 | `page_visits`: policy named "Admin can read visits" allowed **everyone** (29,221 rows) | Low | **Fixed (Step B)** |
| F5 | `sync_customer_points` / `sync_order_count`: unused, anyone could run them | Low | **Fixed (Step B)** |
| F6 | `door-photos` bucket: anyone could **list and download all files** (330 files: 277 door photos, **51 pharmacy prescriptions** = health data) | High | **Fixed (Step D1)** |
| F7 | Photo file names were time-based and guessable (`door-<ms>`, `rx-<ms>-<4 digits>`) | Medium | **Fixed in code (Step D2, PR #14, live after merge)** |
| F8 | `rider.html` ~line 1037 puts `door_photo_url` into an `onclick` **without escaping** (possible script injection into the rider app). The field is never filled today, so not exploitable now | Medium (latent) | Open |
| F9 | `push-test.html` and `diag.html` are public test pages on the server (push test can trigger `notify.php`) | Medium | Open — recommended to delete |
| F10 | `capacitorinit.js` (rider app) saves device tokens with an older public key | Info | Open |
| F11 | `door_photos_delete_old` lets anon delete files older than 30 days — used by our own nightly cron `cleanup_old_door_photos` (03:00 UTC, pg_net + anon key) | Low | Accepted (files are due for deletion anyway) |

## 5. Changes applied (live)

### Step B — close open rules (applied 3 Nov, migration `security_step_b_close_open_rules`)
```sql
alter policy "public read duty_shifts"   on public.duty_shifts using (false);
alter policy "public change duty_shifts" on public.duty_shifts using (false) with check (false);
alter policy "public add duty_shifts"    on public.duty_shifts with check (false);
alter policy notif_clicks_rw on public.notif_clicks using (false) with check (false);
alter policy "Admin can read visits" on public.page_visits using (false);
-- sync_customer_points / sync_order_count: same signature, body now `return;` (no-op)
```
Policies were set to `false` rather than dropped (the database tool asks for confirmation on DROP). Admin keeps its
`admin full access` policies; riders keep working through `rider_duty_*`; customers can still insert page visits.
**Tests:** anon before → after: shifts 193 → 0, clicks 228 → 0, visits 29,221 → 0; anon visit insert still works;
anon shift insert blocked; `increment_notif_click` works; functions still see all shifts. Owner tested rider app,
admin attendance, dashboard visitors, notification taps: all OK.
Files: `supabase/security_step_b.sql`, `supabase/security_step_b_rollback.sql`.

### Step D1 — door-photos can no longer be listed (applied 3 Nov, migration `security_step_d1_door_photos_no_listing`)
```sql
alter policy "Allow public read door-photos" on storage.objects using (false);
alter policy "Public read door photos"       on storage.objects using (false);
update storage.buckets set file_size_limit = 15728640, allowed_mime_types = array['image/*'] where id = 'door-photos';
```
The bucket **stays public**, so exact links already sent on WhatsApp keep working; listing via the API is blocked.
Uploads need only the insert policy and keep working. **Tests:** anon could list 330 files before → 0 after; all
files kept. Owner tested checkout door photo, pharmacy upload, admin photo viewer: all OK.
Files: `supabase/security_step_d1.sql`, `supabase/security_step_d1_rollback.sql`.

### Step D2 — unguessable photo names (code ready, live after PR #14 is merged)
`pages/checkout.html`, `pages/pharmacy.html`, `pages/parcel.html`: names are now `door-|rx-|pcl-` + 32 random hex
characters (`crypto.getRandomValues`), extension whitelisted (jpg, jpeg, png, webp, gif, heic, heif).
**Tests:** 24/24 at 390 and 320 px (new name used, page uses the new link, no page errors).

## 6. Prepared but NOT applied (owner decision)

**Step C — customer phone verification (WhatsApp code).** The owner decided **not** to add login codes for now
("local area, customers are known, keep ordering easy"). A complete, tested draft is kept for later:
- `supabase/security_step_c1.sql` (+ rollback): tables `customer_otp` (bcrypt-hashed codes, 5 min, 5 tries; limits
  1/min, 3/10 min, 8/day per phone, 10/hour per IP/device, 400/day total) and `customer_sessions` (SHA-256 of a
  random 256-bit token, 90 days, revocable); RPCs `customer_otp_create` (service role only), `customer_verify_code`,
  `customer_me`, `customer_logout`, and token versions `my_orders_v2`, `track_order_v2`, `save_my_profile_v2`,
  `delete_my_account_v2`, `customer_cancel_info_v2`, `customer_cancel_order_v2`, `loyalty_status_v2`,
  `referral_me_v2`, `referral_balance_v2`. Rolled-back test: 11/11 passed (same answers as the phone versions).
- `supabase/functions/customer-otp-send/index.ts` (not deployed): sends the code with an approved WhatsApp
  **Authentication** template (`ds_login_code`, Arabic), own secrets `WA_OTP_TOKEN` / `WA_OTP_PHONE_ID`, separate from
  the CRM functions; never returns or logs the code.

## 7. Open items / recommended next steps

1. **Light protection without codes** (proposed, waiting for owner): limit how many different phone numbers one
   device/IP can look up per day; make "delete my account" a request confirmed by admin; return the delivery
   address/GPS from `track_order` only while the order is active.
2. **Delete** `push-test.html` and `diag.html` from Hostinger.
3. **Fix `rider.html`** (escape `door_photo_url`, open it with `window.open` on a validated https URL).
4. Optional: make `door-photos` fully private with short-lived signed links (would break old WhatsApp links).
5. Optional: the nightly photo cleanup could use a service key from Vault instead of the anon key + delete policy.

## 8. Notes for other AI projects on the same Supabase project

- Please **do not re-open** the policies listed in §5 (`duty_shifts` public rules, `notif_clicks_rw`,
  "Admin can read visits", the two `door-photos` read rules). If you need data from these tables, use an admin
  session or a SECURITY DEFINER function with its own check.
- Do not store personal data (phones, addresses, photos, prescriptions) in public buckets or tables readable by anon.
- The customer app relies on these RPC names and signatures — please don't rename or change them without
  coordination: `place_order`, `my_orders`, `track_order`, `loyalty_status`, `referral_balance`, `referral_me`,
  `save_my_profile`, `delete_my_account`, `customer_cancel_info`, `customer_cancel_order`, `increment_notif_click`,
  `track_visit`, `track_page`, `rider_*`.
- Names reserved by the (unapplied) Step C draft: `customer_otp`, `customer_sessions`, `customer_otp_create`,
  `customer_verify_code`, `customer_me`, `customer_logout`, `_customer_of`, `*_v2`, Edge Function `customer-otp-send`.
- Rules followed: least privilege, SECURITY DEFINER + fixed `search_path`, no secrets in frontend code, owner approval
  and a rollback file for every change, Saudi PDPL (protect phones, addresses, order history, home photos,
  prescriptions).
