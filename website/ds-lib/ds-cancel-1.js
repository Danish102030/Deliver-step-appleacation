/* Delivery Step — customer can cancel their own order (order page add-on).
   Shows a "Cancel order" card with a countdown while the database says the order can still be cancelled
   (still waiting, no rider yet, inside the time allowed — 5 minutes by default, set in the admin Settings).
   The database checks everything again on "Yes, cancel", so the page can't be tricked into a late cancel.
   Order number: ?num= / ?order= in the link, else the last order on this phone.
   Phone: ?phone=, else the one saved at checkout, else the one typed on the order page. */
(function () {
  var API = 'https://vjuhxpttssmyomqqomdx.supabase.co/rest/v1/rpc/';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MjQxNjAsImV4cCI6MjA5NDUwMDE2MH0.JiGnmOEPPM3dka-KHIm5mEFs7GWb4Amsnp6R57r7Lro';
  var HELP_WA = '966560957163';
  var REASONS = ['طلبت بالغلط', 'أبي أغيّر الطلب', 'الطلب تأخر', 'سبب آخر'];

  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function qp(n) { try { return new URLSearchParams(location.search).get(n); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var num = String(qp('num') || qp('order') || qp('o') || ls('qibah_last_order_num') || '').replace(/^#/, '').replace('QIB-', 'DS-').trim();
  if (!num || /^DS-(0000|XXXX)$/.test(num)) return;
  var phone = '';                                     // the phone that matched this order
  function phones() {                                 // every phone this device knows, best first
    var c = [qp('phone'), (function () { try { return (JSON.parse(ls('ds_customer') || '{}') || {}).phone; } catch (e) { return ''; } })(), ls('ds_track_phone'), ls('qibah_last_phone')];
    var out = []; c.forEach(function (p) { p = String(p || '').trim(); if (p.replace(/\D/g, '').length >= 9 && out.indexOf(p) < 0) out.push(p); });
    return out;
  }

  function rpc(name, body) {
    return fetch(API + name, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); });
  }
  function wa(to, text) { return 'https://api.whatsapp.com/send?phone=' + String(to || '').replace(/\D/g, '') + '&text=' + encodeURIComponent(text); }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  var css = ''
    + '.dscx-card{direction:rtl;background:#fff7f7;border:1.5px dashed #fecaca;border-radius:18px;padding:16px;margin:12px 16px;font-family:inherit;color:#111827}'
    + '.dscx-in .dscx-card{margin:0 0 14px}'
    + '.dscx-card.plain{background:#fff;border:1px solid #e5e7eb}'
    + '.dscx-h{font-weight:800;font-size:16px}.dscx-m{color:#6b7280;font-size:13px;margin-top:3px;line-height:1.6}'
    + '.dscx-tm{display:flex;align-items:baseline;gap:8px;margin-top:10px}.dscx-tm b{font-size:30px;font-weight:800;color:#b91c1c;letter-spacing:1px;font-family:Inter,system-ui,sans-serif;direction:ltr}'
    + '.dscx-bar{height:6px;border-radius:3px;background:#fee2e2;overflow:hidden;margin:8px 0 12px}.dscx-bar i{display:block;height:100%;background:#dc2626;transition:width 1s linear}'
    + '.dscx-btn{display:flex;width:100%;align-items:center;justify-content:center;gap:7px;border-radius:14px;padding:14px;font-weight:800;font-size:16px;font-family:inherit;cursor:pointer;border:none;text-decoration:none;box-sizing:border-box}'
    + '.dscx-out{border:1.5px solid #fca5a5;color:#b91c1c;background:#fff}.dscx-red{background:#dc2626;color:#fff}.dscx-gr{background:#f3f4f6;color:#111827}'
    + '.dscx-wa{background:#16a34a;color:#fff}.dscx-rose{background:#be185d;color:#fff}.dscx-btn[disabled]{opacity:.6}'
    + '.dscx-ov{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:9998;animation:dscxF .2s}'
    + '.dscx-sh{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#fff;border-radius:24px 24px 0 0;padding:10px 18px calc(22px + env(safe-area-inset-bottom));direction:rtl;font-family:inherit;max-width:560px;margin:0 auto;animation:dscxUp .25s ease-out;color:#111827}'
    + '.dscx-grab{width:42px;height:5px;border-radius:3px;background:#d1d5db;margin:0 auto 12px}'
    + '.dscx-rs{display:flex;align-items:center;gap:10px;border:1.5px solid #e5e7eb;border-radius:14px;padding:13px 14px;margin-bottom:9px;font-size:15px;font-weight:600;cursor:pointer}'
    + '.dscx-rs i{width:20px;height:20px;border-radius:50%;border:2px solid #d1d5db;flex-shrink:0;box-sizing:border-box}'
    + '.dscx-rs.on{border-color:#dc2626;background:#fff5f5}.dscx-rs.on i{border:6px solid #dc2626}'
    + '.dscx-err{color:#b91c1c;font-size:13px;font-weight:700;margin:8px 0 0;min-height:18px}'
    + '.dscx-ok{width:84px;height:84px;border-radius:50%;background:#fee2e2;color:#dc2626;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:800;margin:6px auto 12px}'
    + '.dscx-done{text-align:center}.dscx-done .dscx-btn{margin-top:10px}'
    + '@keyframes dscxUp{from{transform:translateY(40%);opacity:.3}to{transform:none;opacity:1}}@keyframes dscxF{from{opacity:0}to{opacity:1}}';

  var box = null, info = null, endAt = 0, total = 300, tick = null, wasOpen = false;

  function place() {
    if (box) return box;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    box = document.createElement('div'); box.id = 'dscx'; box.style.width = '100%';
    // order page: under the status card · confirmed page: under the delivery-time note
    var tl = document.getElementById('timeline'), anchor = document.querySelector('.anim-card') || document.querySelector('.body > .notice') || (tl && tl.closest ? tl.closest('.card') : null);
    if (!anchor) anchor = document.querySelector('.card');
    if (anchor && anchor.parentNode) { box.className = 'dscx-in'; anchor.parentNode.insertBefore(box, anchor.nextSibling); }
    else document.body.appendChild(box);
    return box;
  }

  function render() {
    var w = info && info.why;
    if (info && info.can_cancel) {
      wasOpen = true;
      place().innerHTML = '<div class="dscx-card"><div class="dscx-h">تبي تلغي الطلب؟</div>'
        + '<div class="dscx-m">تقدر تلغي خلال أول ' + esc(info.minutes) + ' دقائق فقط، قبل تعيين السائق</div>'
        + '<div class="dscx-tm"><b id="dscx-t"></b><span class="dscx-m" style="margin:0">متبقي</span></div>'
        + '<div class="dscx-bar"><i id="dscx-b"></i></div>'
        + '<button type="button" class="dscx-btn dscx-out" id="dscx-go">✕ إلغاء الطلب</button></div>';
      document.getElementById('dscx-go').onclick = openSheet;
      count();
      return;
    }
    stopTimers();
    if (w === 'cancelled' && info.cancelled_by === 'customer') { place().innerHTML = doneHtml(); heroCancelled(); return; }
    var late = w === 'time' || w === 'rider' || w === 'payment' || (wasOpen && w === 'status' && info.status !== 'delivered');
    if (late) {
      place().innerHTML = '<div class="dscx-card plain"><div class="dscx-h">ما يمكن الإلغاء الآن</div>'
        + '<div class="dscx-m" style="margin-bottom:12px">' + (w === 'payment' ? 'طلبات التحويل البنكي تُلغى عن طريق خدمة العملاء.' : 'طلبك صار قيد التنفيذ. للمساعدة تواصل معنا:') + '</div>'
        + '<a class="dscx-btn dscx-wa" target="_blank" rel="noopener" href="' + esc(wa(HELP_WA, 'السلام عليكم، بخصوص طلبي رقم #' + num)) + '">واتساب خدمة العملاء</a></div>';
      return;
    }
    if (box) box.innerHTML = '';
  }

  function count() {
    clearInterval(tick);
    function step() {
      var left = (endAt - Date.now()) / 1000, t = document.getElementById('dscx-t'), b = document.getElementById('dscx-b');
      if (t) t.textContent = mmss(left);
      if (b) b.style.width = Math.max(0, Math.min(100, left / total * 100)) + '%';
      if (left <= 0) { clearInterval(tick); closeSheet(); load(); }
    }
    step(); tick = setInterval(step, 1000);
  }
  function stopTimers() { clearInterval(tick); }

  function load() {
    var list = phone ? [phone] : phones();
    function tryAt(i) {
      if (i >= list.length) return Promise.resolve(null);
      return rpc('customer_cancel_info', { p_order_number: num, p_phone: list[i] }).then(function (r) { if (r && r.found) { phone = list[i]; return r; } return tryAt(i + 1); });
    }
    return tryAt(0).then(function (r) {
      if (!r) { info = null; if (box) box.innerHTML = ''; return; }
      info = r;
      if (r.can_cancel) { endAt = Date.now() + r.seconds_left * 1000; total = (r.minutes || 5) * 60; }
      render();
    }).catch(function () {});
  }

  // Bottom sheet: pick a reason, then confirm
  var pick = REASONS[0];
  function openSheet() {
    closeSheet();
    var ov = document.createElement('div'); ov.className = 'dscx-ov'; ov.id = 'dscx-ov'; ov.onclick = closeSheet;
    var sh = document.createElement('div'); sh.className = 'dscx-sh'; sh.id = 'dscx-sh'; sh.setAttribute('role', 'dialog');
    sh.innerHTML = '<div class="dscx-grab"></div><div style="font-size:20px;font-weight:800">إلغاء الطلب #' + esc(num) + '</div>'
      + '<div class="dscx-m" style="margin:4px 0 14px">ليش تبي تلغي؟ (يساعدنا نتحسن)</div>'
      + REASONS.map(function (r) { return '<div class="dscx-rs' + (r === pick ? ' on' : '') + '" data-r="' + esc(r) + '"><i></i>' + esc(r) + '</div>'; }).join('')
      + '<div class="dscx-err" id="dscx-err"></div>'
      + '<button type="button" class="dscx-btn dscx-red" id="dscx-yes" style="margin-top:6px">نعم، ألغِ الطلب</button>'
      + '<button type="button" class="dscx-btn dscx-gr" id="dscx-no" style="margin-top:9px">لا، أكمل الطلب</button>';
    document.body.appendChild(ov); document.body.appendChild(sh);
    [].forEach.call(sh.querySelectorAll('.dscx-rs'), function (el) {
      el.onclick = function () { pick = el.getAttribute('data-r'); [].forEach.call(sh.querySelectorAll('.dscx-rs'), function (x) { x.classList.toggle('on', x === el); }); };
    });
    document.getElementById('dscx-no').onclick = closeSheet;
    document.getElementById('dscx-yes').onclick = doCancel;
  }
  function closeSheet() { ['dscx-ov', 'dscx-sh'].forEach(function (id) { var e = document.getElementById(id); if (e) e.remove(); }); }

  function doCancel() {
    var yes = document.getElementById('dscx-yes'), err = document.getElementById('dscx-err');
    yes.disabled = true; yes.textContent = 'جاري الإلغاء…'; err.textContent = '';
    rpc('customer_cancel_order', { p_order_number: num, p_phone: phone, p_reason: pick }).then(function (r) {
      if (r && r.ok) { info = r; closeSheet(); stopTimers(); place().innerHTML = doneHtml(); heroCancelled(); showDone(); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} return; }
      closeSheet(); info = r && r.found ? r : info; if (info) { info.can_cancel = false; } render();
    }).catch(function () {
      yes.disabled = false; yes.textContent = 'نعم، ألغِ الطلب'; err.textContent = 'تعذّر الاتصال — تأكد من الإنترنت وحاول مرة ثانية';
    });
  }

  function doneHtml() {
    var v = info && info.vendor_whatsapp;
    return '<div class="dscx-card plain dscx-done"><div class="dscx-ok">✕</div><div style="font-size:22px;font-weight:800">تم إلغاء طلبك</div>'
      + '<div class="dscx-m">طلب #' + esc(num) + ' · لن يتم تحصيل أي مبلغ</div>'
      + (v ? '<a class="dscx-btn dscx-wa" target="_blank" rel="noopener" href="' + esc(wa(v, 'السلام عليكم، تم إلغاء الطلب رقم #' + num + ' من العميل — الرجاء عدم تجهيزه 🙏')) + '">أبلغ ' + esc(info.vendor_name || 'المطعم') + ' بالإلغاء</a>' : '')
      + '<a class="dscx-btn dscx-rose" href="/">اطلب من جديد</a></div>';
  }
  // the rest of the page follows: big title says cancelled, "send order on WhatsApp" buttons go away
  function heroCancelled() {
    var t = document.querySelector('.hero-title'), s = document.querySelector('.hero-sub');
    if (t) t.textContent = 'تم إلغاء طلبك'; if (s) s.textContent = 'ألغيت الطلب بنجاح — نتمنى نخدمك قريباً';
    ['.wa-section', '.body > .notice', '.stars-card'].forEach(function (q) { var e = document.querySelector(q); if (e) e.style.display = 'none'; });
    var hero = document.querySelector('.hero'), bc = document.querySelector('.badge-circle'), bi = bc && bc.querySelector('i');
    if (hero && bc) hero.style.background = 'linear-gradient(160deg,#7f1d1d,#991b1b,#b91c1c)';   // confirmed page: green → red
    if (bc) { bc.style.background = 'linear-gradient(135deg,#f87171,#dc2626)'; bc.style.boxShadow = '0 8px 28px rgba(220,38,38,.45)'; }
    if (bi) bi.className = 'ti ti-x';
    try { if (typeof window.loadOrder === 'function') window.loadOrder(num); } catch (e) {}   // order page redraws its status
  }
  function showDone() {
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);background:#111827;color:#fff;padding:10px 18px;border-radius:20px;font-weight:700;font-size:14px;z-index:10000;direction:rtl;font-family:inherit';
    t.textContent = '✅ تم إلغاء الطلب'; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600);
  }

  function start() {
    var t0 = Date.now();
    load();
    // not found yet (order still reaching the system, or the phone is typed on the page a bit later) → try again for a few minutes
    setInterval(function () { if (!info && Date.now() - t0 < 6 * 60000 && document.visibilityState !== 'hidden') load(); }, 15000);
    // re-check every 20s while it can still be cancelled (a rider may be assigned meanwhile)
    setInterval(function () { if (info && info.can_cancel && document.visibilityState !== 'hidden') load(); }, 20000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && info && (info.can_cancel || wasOpen)) load(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
