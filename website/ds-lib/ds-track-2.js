/* خطوة التوصيل — Admin → Marketing → Visitors. Nothing is shown to the customer; no name and no location are sent.
   1) Each phone ONCE per day + how far it got (opened → shop → cart → checkout): one tiny call only when a NEW step is reached.
      The phone number is linked only when the customer is already logged in / ordered on this phone.
   2) Which page is opened (and which restaurant menu / supermarket category) → "most visited pages".
   3) "Still here" once a minute while the app is open on screen → "Live now". */
(function(){
  'use strict';
  var SB='https://vjuhxpttssmyomqqomdx.supabase.co', KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MjQxNjAsImV4cCI6MjA5NDUwMDE2MH0.JiGnmOEPPM3dka-KHIm5mEFs7GWb4Amsnp6R57r7Lro';
  /* page name from the address — clean (/menu, /shop) or old (/pages/menu.html) */ function pgKey(){ var p=location.pathname.toLowerCase().replace(/\/+$/,''); if(!p||p==='/index.html'||p==='/index') return 'home'; var m=/^\/(?:pages\/)?([a-z0-9_-]+?)(?:\.html)?$/.exec(p); var k=m?m[1]:'other'; return k==='shop'?'dsstore':k; }
  function run(){
    try{
      var ua=navigator.userAgent||'', ls=window.localStorage;
      if(/bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse/i.test(ua)) return;
      var dev=ls.getItem('ds_dev');
      if(!dev||!/^[A-Za-z0-9_-]{8,48}$/.test(dev)){
        dev=(window.crypto&&crypto.randomUUID?crypto.randomUUID():(Date.now().toString(36)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2))).replace(/[^A-Za-z0-9]/g,'').slice(0,32);
        ls.setItem('ds_dev',dev);
      }
      var app=window.DS_APP_VERSION?'ios':(window.Capacitor||/; wv\)/.test(ua))?'android':'web';
      var pk=pgKey(), step=1;
      if(/^(restaurants|coffee|supermarket|marketproducts|menu|pharmacy|buffet|dsstore)$/.test(pk)) step|=2;
      if(pk==='cart') step|=4;
      if(pk==='checkout') step|=8;
      try{ var c=JSON.parse(ls.getItem('qibah_cart')||'[]'); if(Array.isArray(c)&&c.length) step|=4; }catch(e){}
      var phone=''; try{ phone=String((JSON.parse(ls.getItem('ds_customer')||'{}')||{}).phone||''); }catch(e){}
      var src=null;
      if(app==='web'){
        var q=/[?&]utm_source=([^&#]+)/.exec(location.search); var ref=(document.referrer||'').toLowerCase();
        if(q) src=decodeURIComponent(q[1]).toLowerCase().replace(/[^a-z0-9_.-]/g,'').slice(0,24)||null;
        else if(ref&&ref.indexOf(location.host)<0){
          src=/google\./.test(ref)?'google':/instagram\./.test(ref)?'instagram':/(facebook|fb)\./.test(ref)?'facebook':/snapchat\./.test(ref)?'snapchat':
              /tiktok\./.test(ref)?'tiktok':/(twitter|x)\.com|t\.co/.test(ref)?'twitter':/(whatsapp|wa\.me|l\.wl\.co)/.test(ref)?'whatsapp':/bing\./.test(ref)?'bing':'other';
        }
      }
      var day=new Date(Date.now()+3*3600e3).toISOString().slice(0,10);   // Riyadh date
      var st={}; try{ st=JSON.parse(ls.getItem('ds_trk')||'{}')||{}; }catch(e){}
      if(st.d!==day) st={d:day,s:0,p:0};
      var newSteps=step&~st.s, newPhone=!!phone&&!st.p;
      if(!newSteps&&!newPhone&&!(src&&!st.r)) return;                     // nothing new today
      fetch(SB+'/rest/v1/rpc/track_visit',{method:'POST',keepalive:true,
        headers:{'Content-Type':'application/json',apikey:KEY,Authorization:'Bearer '+KEY},
        body:JSON.stringify({p_dev:dev,p_step:step|st.s,p_app:app,p_src:src,p_phone:phone||null})})
        .then(function(r){ if(r&&r.ok){ st.s|=step; if(phone) st.p=1; if(src) st.r=1; try{ ls.setItem('ds_trk',JSON.stringify(st)); }catch(e){} } })
        .catch(function(){});
    }catch(e){}
  }
  // ── page opened + live ──
  var DEV=null, APP=null, PAGE=null, REF=null, hb=null;
  function page(open){
    try{
      if(!PAGE){
        var ua=navigator.userAgent||''; if(/bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse/i.test(ua)) return;
        DEV=localStorage.getItem('ds_dev'); if(!DEV) return;
        APP=window.DS_APP_VERSION?'ios':(window.Capacitor||/; wv\)/.test(ua))?'android':'web';
        PAGE=pgKey();
        var q=new URLSearchParams(location.search);
        if(PAGE==='menu') REF=q.get('id');
        else if(PAGE==='marketproducts'){ REF=q.get('cat'); try{ REF=sessionStorage.getItem('qibah_cat')||REF; }catch(e){} }
      }
      fetch(SB+'/rest/v1/rpc/track_page',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json',apikey:KEY,Authorization:'Bearer '+KEY},
        body:JSON.stringify({p_dev:DEV,p_page:PAGE,p_ref:REF?String(REF).slice(0,80):null,p_app:APP,p_open:!!open})}).catch(function(){});
    }catch(e){}
  }
  function startLive(){
    page(true);
    clearInterval(hb); hb=setInterval(function(){ if(document.visibilityState==='visible') page(false); },60000);
    document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible') page(false); });
  }
  function boot(){ run(); setTimeout(startLive,300); }   // run() first: it creates the phone id on a first visit
  if(document.readyState==='complete') setTimeout(boot,1200); else window.addEventListener('load',function(){ setTimeout(boot,1200); });
})();
