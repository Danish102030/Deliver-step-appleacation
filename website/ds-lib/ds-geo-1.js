/* خطوة التوصيل — website visitors from OUTSIDE Saudi Arabia see a short "not available in your area" screen.
   Nothing changes for customers in Saudi Arabia. Safe by design:
   - never runs inside our iPhone / Android app (the app stores are limited to Saudi Arabia instead);
   - never blocks search-engine robots (Google keeps listing the site);
   - anyone who already ordered or logged in on this phone is always allowed (e.g. a customer travelling);
   - a Saudi visitor is remembered for 30 days (checked once, not on every page);
   - if the country can't be found (slow / blocked lookup) the visitor is ALLOWED;
   - the owner can switch it off in Admin → Settings (settings key geo_block = {"on":false}). */
(function(){
  'use strict';
  try{
    var ua=navigator.userAgent||'';
    if(window.DS_APP_VERSION||window.Capacitor||/; wv\)/.test(ua)) return;                       // our apps
    if(/bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|lighthouse/i.test(ua)) return;  // robots & link previews
    var ls=window.localStorage;
    if(ls.getItem('ds_customer')) return;                                                         // known customer on this phone (ordered / logged in)
    var ok=JSON.parse(ls.getItem('ds_geo_ok')||'null');
    if(ok&&Date.now()-ok.t<30*864e5) return;                                                        // checked recently: Saudi
  }catch(e){ return; }

  var SB='https://vjuhxpttssmyomqqomdx.supabase.co', KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MjQxNjAsImV4cCI6MjA5NDUwMDE2MH0.JiGnmOEPPM3dka-KHIm5mEFs7GWb4Amsnp6R57r7Lro';
  function within(p,ms){ return Promise.race([p,new Promise(function(r){ setTimeout(function(){ r(null); },ms); })]); }
  function j(u,opt){ return fetch(u,opt).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); }
  function country(){
    return within(j('https://api.country.is/'),2500).then(function(a){
      if(a&&/^[A-Z]{2}$/.test(a.country||'')) return a.country;
      return within(j('https://get.geojs.io/v1/ip/country.json'),2500).then(function(b){ return b&&/^[A-Z]{2}$/.test(b.country||'')?b.country:null; });
    });
  }
  function settings(){
    return within(j(SB+'/rest/v1/settings?select=value&key=eq.geo_block',{headers:{apikey:KEY,Authorization:'Bearer '+KEY}}),2500).then(function(r){
      var v=r&&r[0]&&r[0].value; try{ v=typeof v==='string'?JSON.parse(v):v; }catch(e){ v=null; }
      return v&&typeof v==='object'?v:{on:true,allow:['SA']};
    });
  }
  function block(c){
    var html='<div id="ds-geo" style="position:fixed;inset:0;z-index:2147483647;background:linear-gradient(160deg,#9d174d,#5b0d33);color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Tajawal,system-ui,sans-serif;text-align:center;direction:rtl">'+
      '<div style="max-width:380px"><div style="font-size:60px;line-height:1">📍</div>'+
      '<div style="font-size:22px;font-weight:900;margin-top:14px">خدماتنا غير متوفرة في منطقتك</div>'+
      '<div style="font-size:15px;opacity:.9;margin-top:10px;line-height:1.8">خطوة التوصيل تعمل حالياً داخل <b>قبة الأسياح – القصيم</b><br>المملكة العربية السعودية فقط</div>'+
      '<div dir="ltr" style="font-size:13px;opacity:.75;margin-top:16px;line-height:1.7;font-family:system-ui,sans-serif">Delivery Step is currently available only in Qubbah, Al-Qassim, Saudi Arabia.</div>'+
      '<div dir="ltr" style="font-size:12px;opacity:.6;margin-top:18px;font-family:system-ui,sans-serif">info@deliverystep.app</div></div></div>';
    function put(){ if(document.getElementById('ds-geo')) return; document.body.insertAdjacentHTML('beforeend',html); document.documentElement.style.overflow='hidden'; }
    if(document.body) put(); else document.addEventListener('DOMContentLoaded',put);
  }
  country().then(function(c){
    if(!c) return;                                   // unknown → allow
    if(c==='SA'){ try{ localStorage.setItem('ds_geo_ok',JSON.stringify({t:Date.now()})); }catch(e){} return; }
    return settings().then(function(s){
      var allow=Array.isArray(s.allow)&&s.allow.length?s.allow:['SA'];
      if(s.on===false||allow.indexOf(c)>=0) return;
      block(c);
    });
  });
})();
