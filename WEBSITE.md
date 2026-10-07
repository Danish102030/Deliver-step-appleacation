# Website (deliverystep.app) — automatic updates from GitHub

The `website/` folder holds the website files that are kept in GitHub. Its layout matches `public_html` on Hostinger:

```
website/index.html                       →  public_html/
website/pages/…                          →  public_html/pages/
website/ds-lib/…                         →  public_html/ds-lib/
```

When a change to `website/` lands on the `main` branch, GitHub uploads **only the changed files** to Hostinger
(workflow: `.github/workflows/deploy-website.yml`). Phones get the new pages within 2 minutes.

- Nothing on Hostinger is ever deleted.
- Files that are not in `website/` (other pages, PHP files, `.htaccess`, photos) are never touched.
- If the site folder can't be found, nothing is uploaded.

**Rule:** change the pages in `website/` through GitHub, not directly in Hostinger's File Manager. A page edited only on Hostinger
would be replaced the next time the same page is changed here.

## One-time setup

GitHub → this repository → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value (hPanel → Files → FTP Accounts) |
|---|---|
| `FTP_SERVER` | FTP IP or host name |
| `FTP_USERNAME` | FTP user name |
| `FTP_PASSWORD` | FTP password |
| `FTP_DIR` (optional) | only if the site folder is not found automatically |

To upload everything once (for example right after the setup): **Actions → Deploy website to Hostinger → Run workflow**, tick
"Upload every file".
