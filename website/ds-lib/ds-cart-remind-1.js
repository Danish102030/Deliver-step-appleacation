/* Delivery Step — cart reminders (website part).
   1) Tells the database what is in this phone's cart, only for app phones with notifications on (ds_push_token),
      and only when the cart actually changed. The database sends one reminder later if no order is placed.
   2) Home page: a small "your cart is waiting" bar when the cart has items.
   3) Cart page opened from a reminder (?cr=1): a short welcome note. */
(function () {
  var RPC = 'https://vjuhxpttssmyomqqomdx.supabase.co/rest/v1/rpc/cart_reminder_save';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MjQxNjAsImV4cCI6MjA5NDUwMDE2MH0.JiGnmOEPPM3dka-KHIm5mEFs7GWb4Amsnp6R57r7Lro';
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function cart() { try { var c = JSON.parse(ls('qibah_cart') || '[]'); return Array.isArray(c) ? c : []; } catch (e) { return []; } }
  function summary(c) {
    var items = 0, total = 0, shops = [], names = [];
    c.forEach(function (i) {
      var q = Math.max(0, Number(i && i.qty) || 0); items += q; total += q * (Number(i && i.price) || 0);
      var s = String((i && (i.vendor || i.restaurant)) || '').trim(); if (s && shops.indexOf(s) < 0) shops.push(s);
      var n = String((i && i.name) || '').split('\n')[0].trim(); if (n && names.length < 3) names.push(n);
    });
    return { items: items, total: Math.round(total * 100) / 100, shop: shops.slice(0, 2).join(' + ') || 'خطوة التوصيل', names: names.join('، ') };
  }
  var busy = false;
  function sync() {
    var t = ls('ds_push_token'); if (!t || busy) return;
    var s = summary(cart()), h = JSON.stringify([t.slice(-12), s.items, s.total, s.shop]);
    if (h === ls('ds_cart_sync')) return;               // nothing changed → nothing sent
    busy = true;
    try {
      fetch(RPC, { method: 'POST', keepalive: true, headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_token: t, p_items: s.items, p_total: s.total, p_shop: s.shop, p_names: s.names }) })
        .then(function (r) { if (r.ok) { try { localStorage.setItem('ds_cart_sync', h); } catch (e) {} } })
        .catch(function () {}).then(function () { busy = false; });
    } catch (e) { busy = false; }
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') sync(); });
  window.addEventListener('pagehide', sync);
  setInterval(sync, 15000);
  setTimeout(sync, 1500);

  function onReady(f) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', f); else f(); }
  var css = '.dscr-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:96px;width:calc(100% - 32px);max-width:448px;z-index:190;background:#fff;border:1px solid #fbcfe8;border-radius:18px;box-shadow:0 10px 30px rgba(190,24,93,.18);display:flex;align-items:center;gap:10px;padding:10px 12px;direction:rtl;font-family:Tajawal,sans-serif;animation:dscrIn .35s ease}'
    + '.dscr-ic{width:40px;height:40px;border-radius:12px;background:#fdf2f8;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}'
    + '.dscr-t{flex:1;min-width:0}.dscr-t b{display:block;font-size:13.5px;color:#1f1f1f}.dscr-t span{display:block;font-size:11.5px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.dscr-go{background:#be185d;color:#fff;border:none;border-radius:12px;padding:9px 14px;font-weight:800;font-size:13px;font-family:inherit;cursor:pointer;flex-shrink:0}'
    + '.dscr-x{background:none;border:none;color:#9ca3af;font-size:16px;cursor:pointer;padding:4px;flex-shrink:0}'
    + '.dscr-note{margin:12px 16px 0;background:#fdf2f8;border:1px solid #fbcfe8;border-radius:14px;padding:10px 12px;font-size:13px;font-weight:700;color:#9d174d;direction:rtl;font-family:Tajawal,sans-serif}'
    + '@keyframes dscrIn{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}';
  onReady(function () {
    var path = location.pathname, isHome = path === '/' || /\/index\.html$/.test(path), isCart = /\/pages\/cart\.html$/.test(path);
    if (!isHome && !isCart) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var s = summary(cart());
    if (isCart && /[?&]cr=1/.test(location.search) && s.items > 0) {
      var n = document.createElement('div'); n.className = 'dscr-note'; n.textContent = '👋 سلتك محفوظة — أكمل طلبك بخطوة واحدة';
      var host = document.getElementById('cart-content') || document.body.firstElementChild;
      if (host && host.parentNode) host.parentNode.insertBefore(n, host); else document.body.prepend(n);
    }
    if (isHome && s.items > 0) {
      try { if (sessionStorage.getItem('dscr_hide') === '1') return; } catch (e) {}
      var b = document.createElement('div'); b.className = 'dscr-bar'; b.id = 'dscr-bar';
      b.innerHTML = '<div class="dscr-ic">🛒</div><div class="dscr-t"><b>سلتك تنتظرك</b><span></span></div>'
        + '<button class="dscr-go" type="button">أكمل الطلب</button><button class="dscr-x" type="button" aria-label="إغلاق">✕</button>';
      b.querySelector('.dscr-t span').textContent = s.items + (s.items === 1 ? ' صنف' : ' أصناف') + ' · ' + s.total + ' ر.س · ' + s.shop;   // total first, so it is never cut off
      b.querySelector('.dscr-go').onclick = function () { location.href = '/pages/cart.html'; };
      b.querySelector('.dscr-x').onclick = function () { try { sessionStorage.setItem('dscr_hide', '1'); } catch (e) {} b.remove(); };
      document.body.appendChild(b);
    }
  });
})();
