/* خطوة التوصيل — the SAME bottom menu on every page: الرئيسية · سوبرماركت · طلباتي · حسابي
   Include right after the page's <div class="glass-nav-wrap">…</div>:  <script src="/ds-lib/ds-nav-1.js"></script>
   - Rebuilds the menu with the page's own classes (gnav-item / gnav-icon / gnav-label / gnav-dot), so it keeps the page's look.
   - "طلباتي": green number when an order is live (placed in the last 6 hours and not delivered / cancelled),
     tap → quick panel with live + recent orders (account page: opens its own orders section instead).
   - The home page has its own copy (it also shows the live bar) → this file does nothing there. */
(function(){
  'use strict';
  if(document.getElementById('os')) return;                       // home page: has its own menu + panel
  var nav=document.querySelector('.glass-nav'); if(!nav) return;
  var URL_='https://vjuhxpttssmyomqqomdx.supabase.co';
  var KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MjQxNjAsImV4cCI6MjA5NDUwMDE2MH0.JiGnmOEPPM3dka-KHIm5mEFs7GWb4Amsnp6R57r7Lro';
  var path=location.pathname.toLowerCase();
  var here=/\/pages\/(supermarket|marketproducts)\.html/.test(path)?'sm':/\/pages\/account\.html/.test(path)?'acc':'home';
  var isAcc=here==='acc';
  function item(key,icon,label,go){
    var on=here===key;
    return '<div class="gnav-item"'+(go?' data-go="'+go+'"':'')+(key==='ord'?' data-ord="1"':'')+' role="button">'+
      (key==='ord'?'<span class="dsn-ord"><i class="ti '+icon+' gnav-icon" aria-hidden="true"></i><em class="dsn-live" id="dsn-live"></em></span>'
                  :'<i class="ti '+icon+' gnav-icon'+(on?' act':'')+'" aria-hidden="true"></i>')+
      '<span class="gnav-label'+(on?' act':'')+'">'+label+'</span><div class="gnav-dot'+(on?' act':'')+'"></div></div>';
  }
  nav.innerHTML=item('home','ti-home','الرئيسية','/')+item('sm','ti-building-store','سوبرماركت','/pages/supermarket.html?v=14')+
                item('ord','ti-receipt','طلباتي','')+item('acc','ti-user-circle','حسابي','/pages/account.html');
  nav.addEventListener('click',function(e){
    var it=e.target.closest('.gnav-item'); if(!it) return;
    if(it.hasAttribute('data-ord')){ openPanel(); return; }
    var go=it.getAttribute('data-go'); if(go&&!(go==='/pages/account.html'&&isAcc)&&!(go.indexOf('/pages/supermarket.html')===0&&/supermarket\.html/.test(path))) location.href=go;
  });

  var css=document.createElement('style');
  css.textContent=
    '.dsn-ord{position:relative;display:inline-flex}'+
    '.dsn-live{position:absolute;top:-3px;left:-6px;min-width:16px;height:16px;border-radius:8px;background:#16a34a;color:#fff;font-size:10px;font-weight:900;font-style:normal;display:none;align-items:center;justify-content:center;padding:0 4px;box-shadow:0 0 0 2px #fff;font-family:Tajawal,sans-serif}'+
    '.dsn-live.on{display:flex;animation:dsn-p 1.8s ease-in-out infinite}'+
    '@keyframes dsn-p{0%,100%{box-shadow:0 0 0 2px #fff,0 0 0 2px rgba(22,163,74,.5)}50%{box-shadow:0 0 0 2px #fff,0 0 0 7px rgba(22,163,74,0)}}'+
    '.dsn-bg{position:fixed;inset:0;background:rgba(15,8,12,.45);z-index:100000;opacity:0;pointer-events:none;transition:opacity .3s}.dsn-bg.on{opacity:1;pointer-events:all}'+
    '.dsn{position:fixed;bottom:0;right:50%;transform:translateX(50%) translateY(100%);width:100%;max-width:480px;background:#f7f4f6;border-radius:26px 26px 0 0;z-index:100001;transition:transform .38s cubic-bezier(.32,.72,0,1);max-height:86vh;display:flex;flex-direction:column;padding-bottom:env(safe-area-inset-bottom,0px);direction:rtl;font-family:Tajawal,sans-serif}'+
    '.dsn.on{transform:translateX(50%) translateY(0)}'+
    '.dsn-grab{width:40px;height:4px;background:#e5e7eb;border-radius:2px;margin:12px auto 0}'+
    '.dsn-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 18px 10px}.dsn-t{font-size:19px;font-weight:900;color:#1a1022}'+
    '.dsn-x{width:34px;height:34px;border-radius:50%;border:none;background:#fff;color:#6b7280;font-size:15px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.08)}'+
    '.dsn-bd{overflow-y:auto;padding:0 16px 20px;-webkit-overflow-scrolling:touch}'+
    '.dsn-lb{font-size:12.5px;font-weight:800;color:#8b7f88;margin:12px 2px 8px}'+
    '.dsn-a{background:#fff;border-radius:20px;padding:14px;border:1.5px solid #bbf7d0;box-shadow:0 6px 18px rgba(22,101,52,.1);margin-bottom:10px;cursor:pointer}'+
    '.dsn-at{display:flex;align-items:center;justify-content:space-between;gap:8px}.dsn-an{font-size:15px;font-weight:900;color:#1a1022;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '.dsn-as{flex-shrink:0;font-size:11.5px;font-weight:900;color:#15803d;background:#dcfce7;border-radius:20px;padding:3px 10px}.dsn-am{font-size:11.5px;color:#8b7f88;margin-top:3px}'+
    '.dsn-steps{display:flex;gap:5px;margin-top:12px}.dsn-steps i{flex:1;height:5px;border-radius:3px;background:#e5e7eb}.dsn-steps i.on{background:#16a34a}'+
    '.dsn-steps i.now{background:linear-gradient(90deg,#16a34a 0%,#86efac 50%,#16a34a 100%);background-size:200% 100%;animation:dsn-sh 1.4s linear infinite}@keyframes dsn-sh{0%{background-position:200% 0}100%{background-position:-200% 0}}'+
    '.dsn-sl{display:flex;justify-content:space-between;font-size:10px;color:#8b7f88;font-weight:700;margin-top:5px}'+
    '.dsn-btn{display:block;text-align:center;margin-top:12px;background:#16a34a;color:#fff;font-weight:900;font-size:13.5px;border-radius:14px;padding:11px}'+
    '.dsn-h{display:flex;align-items:center;gap:12px;background:#fff;border-radius:16px;padding:12px;border:1px solid #f1e6ec;margin-bottom:8px;cursor:pointer}'+
    '.dsn-hi{width:42px;height:42px;border-radius:13px;background:#fff1f6;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}'+
    '.dsn-hb{flex:1;min-width:0}.dsn-hn{font-size:14px;font-weight:800;color:#1a1022;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dsn-hm{font-size:11.5px;color:#8b7f88;margin-top:2px}'+
    '.dsn-hr{text-align:left;flex-shrink:0}.dsn-hp{font-size:13px;font-weight:900;color:#1a1022}.dsn-hs{font-size:10.5px;font-weight:800;margin-top:2px;color:#15803d}.dsn-hs.x{color:#b91c1c}.dsn-hs.old{color:#9ca3af}'+
    '.dsn-empty{text-align:center;padding:26px 10px 10px;color:#8b7f88;font-size:13.5px;line-height:1.8}.dsn-empty .big{font-size:44px;display:block;margin-bottom:6px}'+
    '.dsn-cta{display:block;text-align:center;margin-top:12px;background:#be185d;color:#fff;font-weight:900;font-size:14px;border-radius:14px;padding:12px;text-decoration:none}'+
    '.dsn-all{display:block;text-align:center;margin-top:6px;color:#be185d;font-weight:800;font-size:13px;padding:10px;text-decoration:none}'+
    '.dsn-sk{background:linear-gradient(90deg,#f0e4e9 25%,#fce7f3 50%,#f0e4e9 75%);background-size:200% 100%;animation:dsn-sh 1.5s infinite;border-radius:16px}';
  document.head.appendChild(css);

  var DONE=['delivered','cancelled','canceled','done_old','rejected'];
  var LABEL={pending:'استلمنا طلبك',on_hold:'قيد المراجعة',assigned:'المندوب استلم طلبك',accepted:'المندوب استلم طلبك',preparing:'يتم تجهيز طلبك',ready:'طلبك جاهز',picked:'المندوب في الطريق إليك',on_the_way:'المندوب في الطريق إليك',out_for_delivery:'المندوب في الطريق إليك',delivered:'تم التوصيل',cancelled:'ملغي',canceled:'ملغي'};
  var STEP={pending:1,on_hold:1,assigned:2,accepted:2,preparing:2,ready:2,picked:3,on_the_way:3,out_for_delivery:3,delivered:4};
  var LIST=null, busy=false, sbc=null;
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function phone(){ try{ return String((JSON.parse(localStorage.getItem('ds_customer')||'{}')||{}).phone||'').trim(); }catch(e){ return ''; } }
  function active(o){ return o&&DONE.indexOf(o.order_status)<0&&(Date.now()-new Date(o.created_at).getTime())<6*3600e3; }
  function ago(t){ var m=Math.max(0,Math.round((Date.now()-new Date(t).getTime())/60000)); if(m<1)return 'الآن'; if(m<60)return 'قبل '+m+' د'; var h=Math.round(m/60); if(h<24)return 'قبل '+h+' س';
    try{ return new Date(t).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn',{day:'numeric',month:'long'}); }catch(e){ return new Date(t).toISOString().slice(0,10); } }
  function track(o){ return '/pages/order-tracking.html?num='+encodeURIComponent(o.order_number||''); }
  function num(x){ return Number(x)||0; }
  function client(){ if(sbc) return sbc; try{ if(window.supabase&&window.supabase.createClient) sbc=window.supabase.createClient(URL_,KEY,{auth:{persistSession:false,autoRefreshToken:false}}); }catch(e){} return sbc; }
  function load(force){
    var ph=phone(); if(!ph){ LIST=[]; badge(); return; }
    if(!force){ try{ var c=JSON.parse(sessionStorage.getItem('ds_myorders')||'null'); if(c&&c.p===ph&&Date.now()-c.t<60000){ LIST=c.l; badge(); return; } }catch(e){} }
    var sb=client(); if(!sb||busy) return; busy=true;
    sb.rpc('my_orders',{p_phone:ph}).then(function(r){
      busy=false;
      if(r&&!r.error&&Array.isArray(r.data)){
        LIST=r.data.slice(0,20).map(function(o){ return {id:o.id,created_at:o.created_at,order_number:o.order_number,order_status:o.order_status||'pending',vendor_name:o.vendor_name||'طلب',total:o.total,
          n:Array.isArray(o.items)?o.items.reduce(function(s,i){ return s+(Number(i.quantity)||1); },0):0}; });
        try{ sessionStorage.setItem('ds_myorders',JSON.stringify({p:ph,t:Date.now(),l:LIST})); }catch(e){}
      }
      badge(); if(pan&&pan.classList.contains('on')) render();
    },function(){ busy=false; });
  }
  function badge(){ var b=document.getElementById('dsn-live'); if(!b) return; var n=(LIST||[]).filter(active).length; b.textContent=n; b.classList.toggle('on',n>0); }
  var bg=null, pan=null;
  function build(){
    if(pan) return;
    bg=document.createElement('div'); bg.className='dsn-bg'; bg.onclick=closePanel;
    pan=document.createElement('div'); pan.className='dsn'; pan.setAttribute('role','dialog'); pan.setAttribute('aria-label','طلباتي');
    pan.innerHTML='<div class="dsn-grab"></div><div class="dsn-hd"><div class="dsn-t">طلباتي</div><button class="dsn-x" aria-label="إغلاق">✕</button></div><div class="dsn-bd" id="dsn-bd"></div>';
    pan.querySelector('.dsn-x').onclick=closePanel;
    document.body.appendChild(bg); document.body.appendChild(pan);
  }
  function openPanel(){
    if(isAcc&&typeof window.toggleExp==='function'&&document.getElementById('body-orders')){   // account page: its own orders list
      var body=document.getElementById('body-orders'); if(!body.classList.contains('open')) window.toggleExp('orders');   // open it (never closes it)
      var row=body.previousElementSibling||body; row.scrollIntoView({behavior:'smooth',block:'start'}); return;
    }
    build(); bg.classList.add('on'); pan.classList.add('on'); document.body.style.overflow='hidden'; render(); load(true);
  }
  function closePanel(){ if(!pan) return; bg.classList.remove('on'); pan.classList.remove('on'); document.body.style.overflow=''; }
  function render(){
    var bd=document.getElementById('dsn-bd'); if(!bd) return;
    if(!phone()){ bd.innerHTML='<div class="dsn-empty"><span class="big">👋</span>سجّل برقم جوالك عشان تشوف طلباتك وتتبعها<a class="dsn-cta" href="/pages/account.html">تسجيل الدخول</a></div>'; return; }
    if(LIST===null){ bd.innerHTML='<div class="dsn-sk" style="height:150px;margin-top:6px"></div><div class="dsn-sk" style="height:66px;margin-top:10px"></div>'; return; }
    if(!LIST.length){ bd.innerHTML='<div class="dsn-empty"><span class="big">🧾</span>ما عندك طلبات للحين<br>اطلب من مطاعم قبة والسوبرماركت لباب بيتك<a class="dsn-cta" href="/pages/restaurants.html">اطلب الآن</a></div>'; return; }
    var act=LIST.filter(active), past=LIST.filter(function(o){ return !active(o); }).slice(0,6), h='';
    if(act.length){ h+='<div class="dsn-lb">🟢 طلبات جارية</div>'+act.map(function(o){ var st=STEP[o.order_status]||1;
      return '<div class="dsn-a" data-href="'+esc(track(o))+'"><div class="dsn-at"><div class="dsn-an">'+esc(o.vendor_name)+'</div><span class="dsn-as">'+esc(LABEL[o.order_status]||'قيد التنفيذ')+'</span></div>'+
        '<div class="dsn-am">'+(o.order_number?'#'+esc(o.order_number)+' · ':'')+ago(o.created_at)+(o.total!=null?' · '+num(o.total)+' ر.س':'')+'</div>'+
        '<div class="dsn-steps">'+[1,2,3,4].map(function(i){ return '<i class="'+(i<st?'on':i===st?'now':'')+'"></i>'; }).join('')+'</div>'+
        '<div class="dsn-sl"><span>استلمنا</span><span>مع المندوب</span><span>في الطريق</span><span>وصل</span></div><span class="dsn-btn">تتبع الطلب على الخريطة ←</span></div>'; }).join(''); }
    if(past.length){ h+='<div class="dsn-lb">🧾 طلباتك السابقة</div>'+past.map(function(o){ var x=/^cancel/.test(o.order_status), done=DONE.indexOf(o.order_status)>=0;
      return '<div class="dsn-h" data-href="'+esc(track(o))+'"><div class="dsn-hi">'+(/سوبرماركت/.test(o.vendor_name)?'🛒':'🍽️')+'</div>'+
        '<div class="dsn-hb"><div class="dsn-hn">'+esc(o.vendor_name)+'</div><div class="dsn-hm">'+ago(o.created_at)+(o.n?' · '+o.n+' منتج':'')+'</div></div>'+
        '<div class="dsn-hr"><div class="dsn-hp">'+(o.total!=null?num(o.total)+' ر.س':'')+'</div><div class="dsn-hs'+(x?' x':'')+(done?'':' old')+'">'+(done?esc(LABEL[o.order_status]||o.order_status):'منتهي')+'</div></div></div>'; }).join(''); }
    h+='<a class="dsn-all" href="/pages/account.html">كل الطلبات وبطاقة الولاء ←</a>';
    bd.innerHTML=h;
    Array.prototype.forEach.call(bd.querySelectorAll('[data-href]'),function(el){ el.onclick=function(){ location.href=el.getAttribute('data-href'); }; });
  }
  function start(){ setTimeout(function(){ load(false); },1200); }
  if(document.readyState==='complete') start(); else window.addEventListener('load',start);
  document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible') load(false); });
  window.DSNav={open:openPanel,close:closePanel,reload:function(){ load(true); }};
})();
