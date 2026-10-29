# Website (deliverystep.app) — automatic updates from GitHub

`website/` holds the website files kept in GitHub. Its layout matches `public_html` on Hostinger:

```
website/index.html     →  public_html/
website/pages/…        →  public_html/pages/
website/ds-lib/…       →  public_html/ds-lib/
```

## How a change goes live
1. Claude makes and tests the change on its branch and opens a pull request.
2. The owner taps **Merge** (GitHub app or website) — that is the OK.
3. GitHub uploads **only the changed files** to Hostinger (`.github/workflows/deploy-website.yml`); phones get them
   within 2 minutes.

Safety: nothing on Hostinger is ever deleted; files not in `website/` (admin.html, PHP files, photos, account /
order pages) are never touched; each file is swapped in one step; the server's old copy of every replaced file is kept
with the run for 90 days (**Actions → the run → Artifacts → replaced-files-N**); if the site folder can't be found,
nothing is uploaded. An automatic run never uploads more than 12 files (more = run by hand, naming the files). **Run → files `--check`** only looks at the server.

**Rule:** change the pages in `website/` through GitHub, not in Hostinger's File Manager — a page edited only on
Hostinger is replaced the next time the same file changes here. Since 29 Oct `admin.html`, `pages/account.html`,
`pages/order-tracking.html` and `pages/order-confirmed.html` are here too. The Mapbox keys are NOT: they live only in
`public_html/map-key.js` (uploaded by hand, git-ignored); the pages load `/map-key.js?v=2` (raise the number after every change to that file — the iPhone app keeps scripts up to a day) before their own scripts
(`window.DS_MAPBOX_TOKEN` for admin + tracking, `window.DS_MAPBOX_TOKEN_CHECKOUT` for checkout). Without that file
everything works except the maps / GPS address.

## One-time setup (owner)
GitHub → this repository → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value (hPanel → Files → FTP Accounts) |
|---|---|
| `FTP_SERVER` | FTP host or IP (optionally `host:port`) |
| `FTP_USERNAME` | FTP user name |
| `FTP_PASSWORD` | FTP password |
| `FTP_DIR` (optional) | only if the site folder is not found automatically |

Until these exist the workflow only prints a note.

## Upload chosen files by hand
**Actions → Deploy website to Hostinger → Run workflow**, type the files (e.g. `website/terms.html`), Run.

## Known differences between git and the live site (29 Oct)
Never uploaded on purpose — check before the first change to them: `website/dssearch.js`,
`website/ds-lib/ds-track-2.js`, `ds-nav-2.js`, `ds-cart-remind-2.js` (git is newer than live), and
`ds-lib/ds-store-card-1.svg` (not on the server; only a fallback picture). Files in `ds-lib/` are cached for a year:
a changed one gets a new number (`-3.js`) and the pages are updated to load it.
