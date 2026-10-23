# Delivery Step (خطوة التوصيل) — read this first

Customer website + app for a local delivery business in Qubbah (قبة), Al Qassim, Saudi Arabia: restaurants,
coffee, supermarket (~1,950 products), parcels, pharmacy, the owner's own shop (متجر خطوة). Live, 500+ daily opens.
**Full context, decisions and open items: [HANDOVER.md](HANDOVER.md).** Saved-for-later ideas: [BACKLOG.md](BACKLOG.md).

## Working with the owner
- Non-technical. Reply in **simple English**, short. Give a recommendation first, then options.
- **Mockup first, build only after "approved"** (HTML mockup + screenshot at phone width). Show before/after screenshots.
- Customer pages are Arabic RTL (Tajawal font, rose `#be185d`). The admin panel UI is in English.
- Test everything before handing over (Playwright on a local Apache copy — see HANDOVER.md), at 390px and 320px width.

## Hard rules
- **Never print, repeat or ask for secrets**: passwords, the order hook secret, `order-hook.php` / `order-relay.php` /
  `notify.php` contents, the Mapbox token, SMS keys. FTP passwords live only in GitHub secrets.
- `admin.html`, `account.html`, `order-tracking.html`, `order-confirmed.html` (latest versions) are **not in git**
  (admin contains the Mapbox token). Get the current copy from Hostinger `public_html` before editing.
- **Never change the live site or live database without the owner's OK** for that change. Upload only tested files,
  keep a copy of the file you replace.
- No pull requests unless asked. Commit trailer is given by the session; no model names in commits.
- Supabase project `vjuhxpttssmyomqqomdx`. Statements containing DROP / DELETE time out in the database tool
  (confirmation prompt) — use `ALTER POLICY … USING (false)`, `is_active=false`, upserts instead.
