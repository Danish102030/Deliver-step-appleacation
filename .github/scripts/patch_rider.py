#!/usr/bin/env python3
"""Small, exact changes to the live rider page (public_html/rider.html) — that file is NOT in this repository
(it holds server-only settings), so it can't go through the normal website upload. Used by
.github/workflows/patch-rider.yml.

  python3 patch_rider.py check  → download rider.html, test that every change fits exactly once, upload NOTHING
  python3 patch_rider.py apply  → same test, then upload the changed file (old copy kept with the GitHub run)
  python3 patch_rider.py local <file>  → apply the changes to a local copy (for testing)

Safety: each change must match exactly once, otherwise nothing is uploaded. A file that already carries the
patch marker is left alone. The server copy is downloaded first and kept as an artifact for 90 days.

Patch rider-wa-1 (owner approved 16 Nov 2026):
  * "📤 أرسل الصورة للعميل" opens THIS customer's WhatsApp chat (api.whatsapp.com/send?phone=966…) with the message
    and a link to the order photo (uploaded to the door-photos bucket under a random name), instead of the
    phone's share sheet (which can't choose a person → WhatsApp showed every contact).
  * Wrong customer numbers are caught: a clear message instead of opening WhatsApp with a number that doesn't exist.
  * normalizePhone: Arabic digits, 00 / +966 / 9660… prefixes; empty number → '' (not '966').
  * New small "مشاركة…" button keeps the old share sheet (real photo, rider picks the chat).
"""
import io, os, sys

MARK = 'DS-PATCH rider-wa-1'
REMOTE_NAME = 'rider.html'

NEW_FUNCS = r"""/* DS-PATCH rider-wa-1 (16 Nov 2026): the photo goes straight to THIS customer's WhatsApp chat */
function dsCustWa(phone){const p=normalizePhone(phone);return /^9665\d{8}$/.test(p)?p:'';}
function oiPrep(cv,o){
  const p=dsCustWa(o.customer_whatsapp||o.customer_phone); o._dsWa=p;
  const sub=document.getElementById('oi-sub');
  if(sub) sub.textContent=p?('✓ يفتح محادثة العميل مباشرة · ‎+'+p.slice(0,3)+' '+p.slice(3,5)+' '+p.slice(5,8)+' '+p.slice(8)):'⚠️ رقم العميل غير صحيح — اتصل بالعميل أو استخدم «مشاركة…»';
  if(!p) return;
  o._dsUp=new Promise(function(res){
    try{ cv.toBlob(async function(b){
      try{
        if(!b) return res('');
        const a=new Uint8Array(16); crypto.getRandomValues(a);
        const name='ord-'+Array.from(a,function(x){return x.toString(16).padStart(2,'0');}).join('')+'.jpg';
        const r=await sb.storage.from('door-photos').upload(name,b,{contentType:'image/jpeg',upsert:false});
        if(r.error) return res('');
        res(sb.storage.from('door-photos').getPublicUrl(name).data.publicUrl||'');
      }catch(e){ res(''); }
    },'image/jpeg',0.85); }catch(e){ res(''); }
  });
  o._dsUp.then(function(u){ o._dsUrl=u; });
}
async function oiSendToCustomer(cv,o){
  const p=(o._dsWa!==undefined)?o._dsWa:dsCustWa(o.customer_whatsapp||o.customer_phone);
  if(!p){ showToast('⚠️ رقم العميل غير صحيح ('+(o.customer_phone||'—')+') — اتصل بالعميل أو استخدم «مشاركة…»'); return; }
  const num=o.order_number||'';
  const base='مرحباً 👋\n*أنا مندوب خطوة التوصيل* 🛵\nهذا طلبك رقم #'+num+' — يرجى تأكيده ✅\n*نحن في الطريق إليك ونصل قريباً* 🚀';
  if(o._dsUrl!==undefined){   // photo ready → open the customer's chat in this same tap
    openLink('https://api.whatsapp.com/send?phone='+p+'&text='+encodeURIComponent(base+(o._dsUrl?'\n📷 صورة طلبك: '+o._dsUrl:'')));
    return;
  }
  const btn=document.getElementById('oi-cust');
  if(btn){ btn.disabled=true; btn.textContent='⏳ جاري تجهيز الصورة…'; }
  const u=await Promise.race([o._dsUp||Promise.resolve(''),new Promise(function(r){setTimeout(function(){r('');},10000);})]);
  o._dsUrl=u||'';
  if(btn){ btn.disabled=false; btn.textContent=u?'✅ الصورة جاهزة — اضغط لفتح واتساب العميل':'📤 افتح واتساب العميل (بدون صورة — أرفقها من «⬇️ حفظ»)'; }
  showToast(u?'✅ الصورة جاهزة — اضغط الزر مرة ثانية':'تعذّر رفع الصورة — اضغط الزر لفتح المحادثة');
}
"""

CHANGES = [
    # 1) phone clean-up (also used for restaurants): Arabic digits, 00 / +966 / 9660…, empty stays empty
    ("function normalizePhone(phone){const p=(phone||'').replace(/\\D/g,'');return p.startsWith('966')?p:'966'+p.replace(/^0/,'');}",
     "function normalizePhone(phone){let p=String(phone||'').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);})"
     ".replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);}).replace(/\\D/g,'').replace(/^00/,'');"
     "if(!p)return '';return p.startsWith('966')?'966'+p.slice(3).replace(/^0+/,''):'966'+p.replace(/^0+/,'');}  /* DS-PATCH rider-wa-1 */"),
    # 2) green WhatsApp button: a wrong customer number gives a message instead of "number does not exist"
    ("function waCustomer(phone,orderNum){",
     "function waCustomer(phone,orderNum){\n  if(!dsCustWa(phone)){showToast('⚠️ رقم العميل غير صحيح ('+phone+') — اتصل بالعميل');return;}  // DS-PATCH rider-wa-1"),
    # 3) photo preview: green button + the number it will open + a new "مشاركة…" button (old share sheet)
    ("background:#2563eb;color:#fff;border:none;border-radius:14px;padding:16px;font-size:15px;font-weight:900;font-family:inherit;cursor:pointer\">📤 أرسل الصورة للعميل</button>'",
     "background:#16a34a;color:#fff;border:none;border-radius:14px;padding:16px;font-size:15px;font-weight:900;font-family:inherit;cursor:pointer\">📤 أرسل الصورة للعميل على واتساب</button>"
     "<div id=\"oi-sub\" style=\"color:#86efac;font-size:12px;text-align:center;margin-top:-3px\"></div>'"),
    ("+'<button id=\"oi-close\"",
     "+'<button id=\"oi-any\" style=\"flex:1;background:#334155;color:#fff;border:none;border-radius:12px;padding:12px;font-size:12.5px;font-weight:700;font-family:inherit;cursor:pointer\">مشاركة…</button>'\n    +'<button id=\"oi-close\""),
    ("document.getElementById('oi-cust').onclick=()=>oiShare(cv,o,'العميل');",
     "document.getElementById('oi-cust').onclick=()=>oiShare(cv,o,'العميل');\n"
     "  oiPrep(cv,o); document.getElementById('oi-any').onclick=()=>oiShare(cv,Object.assign({},o,{_dsShareAll:1}),'العميل');  // DS-PATCH rider-wa-1"),
    # 4) the customer button no longer opens the share sheet — it opens the customer's own chat
    ("async function oiShare(cv,o,who){",
     NEW_FUNCS + "async function oiShare(cv,o,who){\n  if(who==='العميل'&&!o._dsShareAll) return oiSendToCustomer(cv,o);  // DS-PATCH rider-wa-1"),
]


def apply(text):
    if MARK in text:
        return None, ['already patched (marker found) — nothing to do']
    report, bad = [], False
    for i, (old, new) in enumerate(CHANGES, 1):
        n = text.count(old)
        report.append(f'change {i}: found {n}x' + ('' if n == 1 else '  ← must be exactly 1'))
        if n != 1:
            bad = True
    if bad:
        return None, report + ['NOT applied: the live file is different from what was tested. Nothing uploaded.']
    for old, new in CHANGES:
        text = text.replace(old, new, 1)
    return text, report + ['all changes fit']


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'check'
    if mode == 'local':
        p = sys.argv[2]
        new, rep = apply(open(p, encoding='utf-8').read())
        print('\n'.join(rep))
        if new is None:
            raise SystemExit(1)
        open(p, 'w', encoding='utf-8').write(new)
        return
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import deploy_website as dw
    server = os.environ.get('FTP_SERVER', '').strip()
    for prefix in ('ftp://', 'ftps://'):
        if server.startswith(prefix):
            server = server[len(prefix):]
    host, _, port = server.rstrip('/').partition(':')
    ftp = dw.connect(host, int(port or 21), os.environ.get('FTP_USERNAME', '').strip(),
                     os.environ.get('FTP_PASSWORD', ''), os.environ.get('FTP_REQUIRE_TLS', '').lower() == 'true')
    try:
        site = dw.find_site(ftp, os.environ.get('FTP_DIR', '').strip().strip('/'))
        remote = site.rstrip('/') + '/' + REMOTE_NAME
        size = dw.backup(ftp, remote, REMOTE_NAME)          # keeps the server copy in replaced-files/
        if size is None:
            raise SystemExit('rider.html not found on the server. Nothing uploaded.')
        path = os.path.join(dw.BACKUP_DIR, REMOTE_NAME)
        old = open(path, encoding='utf-8').read()
        dw.log(f'Downloaded {REMOTE_NAME} ({size:,} bytes, {old.count(chr(10)) + 1} lines).')
        new, rep = apply(old)
        for r in rep:
            dw.log('  ' + r)
        if new is None:
            if MARK in old:
                return
            raise SystemExit(1)
        if mode != 'apply':
            dw.log('Check only — nothing uploaded. Run again with "apply" to put it live.')
            return
        os.makedirs('patched', exist_ok=True)
        out = os.path.join('patched', REMOTE_NAME)
        open(out, 'w', encoding='utf-8').write(new)
        dw.upload(ftp, out, remote)
        dw.log(f'Uploaded the changed {REMOTE_NAME}. The old copy is kept with this run (Artifacts).')
    finally:
        try:
            ftp.quit()
        except Exception:
            ftp.close()


if __name__ == '__main__':
    main()
