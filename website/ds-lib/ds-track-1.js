/* خطوة التوصيل — count each phone ONCE per day and how far it got (opened → shop → cart → checkout).
   Feeds Admin → Marketing → Visitors. Nothing is shown to the customer. Sends no name and no location;
   the phone number is linked only when the customer is already logged in / ordered on this phone.
   At most one tiny call when the phone reaches a NEW step today (usually 1–3 calls a day). */
(function(){
  'use strict';
  var SB='https://vjuhxpttssmyomqqomdx.supabase.co', KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MjQxNjAsImV4cCI6MjA5NDUwMDE2MH0.JiGnmOEPPM3dka-KHIm5mEFs7GWb4Amsnp6R57r7Lro';
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
      var p=location.pathname, step=1;
      if(/\/pages\/(restaurants|coffee|supermarket|marketproducts|menu|pharmacy|buffet)/.test(p)) step|=2;
      if(/\/pages\/cart/.test(p)) step|=4;
      if(/\/pages\/checkout/.test(p)) step|=8;
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
  if(document.readyState==='complete') setTimeout(run,1200); else window.addEventListener('load',function(){ setTimeout(run,1200); });
})();
