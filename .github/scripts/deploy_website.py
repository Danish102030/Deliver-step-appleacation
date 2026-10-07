#!/usr/bin/env python3
"""Upload website files from this repository to Hostinger (public_html) over FTP.

Used by .github/workflows/deploy-website.yml. Only the files listed in the file given as the first
argument are uploaded (paths inside website/, e.g. "website/pages/menu.html").

Safety rules:
  * Nothing on the server is ever deleted.
  * Files on the server that are not in website/ (other pages, PHP files, .htaccess, photos) are never touched.
  * The upload goes to the site folder only after checking it really is the site (index.html + pages/ there);
    otherwise it stops without uploading anything.
  * Each file is uploaded under a temporary name first and then renamed, so customers never get a half-written page.
  * Encrypted FTP (TLS) is used when the server offers it.

Settings (GitHub repository secrets):
  FTP_SERVER     host name or IP from hPanel → Files → FTP Accounts (optionally host:port)
  FTP_USERNAME   FTP user name
  FTP_PASSWORD   FTP password
  FTP_DIR        optional: the site folder as seen by this FTP account (found automatically when empty)
  FTP_REQUIRE_TLS optional: "true" = never fall back to unencrypted FTP
"""
import ftplib
import io
import os
import posixpath
import ssl
import sys

LOCAL_ROOT = 'website'
SITE_CANDIDATES = ['.', 'public_html', 'domains/deliverystep.app/public_html']


def log(msg):
    print(msg, flush=True)


def connect(host, port, user, password, require_tls):
    """Encrypted FTP first; plain FTP only when the server has no TLS (and that is allowed)."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False          # hosting FTP certificates rarely match the IP / ftp host name
    ctx.verify_mode = ssl.CERT_NONE     # still encrypted; the password never travels in clear text
    ftp = ftplib.FTP_TLS(context=ctx, timeout=60)
    try:
        ftp.connect(host, port)
        ftp.auth()
        ftp.login(user, password)
        ftp.prot_p()
        log('Connected with encryption (FTP over TLS).')
        return ftp
    except ftplib.error_perm as e:
        ftp.close()
        if str(e).startswith('530'):
            raise SystemExit('FTP login failed: check FTP_USERNAME and FTP_PASSWORD.')
        tls_error = e
    except (ssl.SSLError, ftplib.error_reply, ftplib.error_temp, OSError) as e:
        ftp.close()
        tls_error = e
    if require_tls:
        raise SystemExit(f'The server did not accept encrypted FTP ({tls_error}) and FTP_REQUIRE_TLS is true.')
    log(f'::warning::Encrypted FTP not available ({tls_error}); using plain FTP.')
    ftp = ftplib.FTP(timeout=60)
    ftp.connect(host, port)
    try:
        ftp.login(user, password)
    except ftplib.error_perm:
        raise SystemExit('FTP login failed: check FTP_USERNAME and FTP_PASSWORD.')
    return ftp


def names(ftp, path):
    try:
        return {posixpath.basename(n.rstrip('/')) for n in ftp.nlst(path)}
    except ftplib.error_perm:
        return set()


def is_site(ftp, path):
    found = names(ftp, path)
    return 'index.html' in found and 'pages' in found


def find_site(ftp, wanted):
    if wanted:
        if is_site(ftp, wanted):
            return wanted
        raise SystemExit(f'FTP_DIR "{wanted}" does not look like the website (no index.html + pages/ there). Nothing uploaded.')
    for c in SITE_CANDIDATES:
        if is_site(ftp, c):
            return c
    raise SystemExit('Could not find the website folder (index.html + pages/) for this FTP account. '
                     'Set the FTP_DIR secret to the folder that holds index.html. Nothing uploaded.')


def ensure_dir(ftp, path, made):
    if path in ('', '.') or path in made:
        return
    parent = posixpath.dirname(path)
    ensure_dir(ftp, parent, made)
    if posixpath.basename(path) not in names(ftp, parent or '.'):
        ftp.mkd(path)
    made.add(path)


def upload(ftp, local_path, remote_path):
    tmp = remote_path + '.ds-upload-tmp'
    with open(local_path, 'rb') as fh:
        data = fh.read()
    ftp.storbinary('STOR ' + tmp, io.BytesIO(data))
    try:
        ftp.rename(tmp, remote_path)                     # replaces the old file in one step
    except ftplib.error_perm:
        try:
            ftp.delete(remote_path)                      # some servers will not rename over an existing file
        except ftplib.error_perm:
            pass
        try:
            ftp.rename(tmp, remote_path)
        except ftplib.error_perm:
            ftp.storbinary('STOR ' + remote_path, io.BytesIO(data))
            try:
                ftp.delete(tmp)
            except ftplib.error_perm:
                pass
    return len(data)


def main():
    if len(sys.argv) != 2:
        raise SystemExit('usage: deploy_website.py <file with the list of changed files>')
    with open(sys.argv[1], encoding='utf-8') as fh:
        wanted = [l.strip() for l in fh if l.strip()]
    files = []
    for p in wanted:
        norm = posixpath.normpath(p)
        if not norm.startswith(LOCAL_ROOT + '/') or '..' in norm.split('/'):
            continue                                     # only files inside website/
        if os.path.isfile(norm):                         # deleted files are skipped (nothing is deleted on the server)
            files.append(norm)
    if not files:
        log('No website files to upload.')
        return
    server = os.environ.get('FTP_SERVER', '').strip()
    user = os.environ.get('FTP_USERNAME', '').strip()
    password = os.environ.get('FTP_PASSWORD', '')
    if not (server and user and password):
        raise SystemExit('FTP_SERVER, FTP_USERNAME and FTP_PASSWORD must be set.')
    for prefix in ('ftp://', 'ftps://'):
        if server.startswith(prefix):
            server = server[len(prefix):]
    server = server.rstrip('/')
    host, _, port = server.partition(':')
    ftp = connect(host, int(port or 21), user, password, os.environ.get('FTP_REQUIRE_TLS', '').lower() == 'true')
    try:
        site = find_site(ftp, os.environ.get('FTP_DIR', '').strip().strip('/'))
        log(f'Website folder on the server: {site}')
        made, total = set(), 0
        for f in files:
            rel = f[len(LOCAL_ROOT) + 1:]
            remote = posixpath.normpath(posixpath.join(site, rel))
            ensure_dir(ftp, posixpath.dirname(remote), made)
            size = upload(ftp, f, remote)
            total += size
            log(f'  uploaded {rel} ({size:,} bytes)')
        log(f'Done: {len(files)} file(s), {total:,} bytes. Customers get the new pages within 2 minutes.')
    finally:
        try:
            ftp.quit()
        except Exception:
            ftp.close()


if __name__ == '__main__':
    main()
