/* خطوة التوصيل — start loading the next page the moment a finger touches a button (≈100–300 ms earlier),
   so it opens instantly when the finger lifts. Only our own pages; each page at most once. */
(function(){
  'use strict';
  var done={}, n=0;
  function target(el){
    if(!el||!el.closest) return null;
    var a=el.closest('a[href]'); if(a&&!a.target) return a.getAttribute('href');
    var g=el.closest('[data-go]'); if(g) return g.getAttribute('data-go');
    var c=el.closest('[onclick]'); if(c){ var m=/location\.href\s*=\s*['"]([^'"]+)['"]/.exec(c.getAttribute('onclick')||''); if(m) return m[1]; }
    return null;
  }
  function warm(e){
    var t=target(e.target); if(!t||n>=12) return;
    try{
      var u=new URL(t,location.href);
      if(u.origin!==location.origin||!/\.html$|\/$|\/[a-z0-9_-]+$/i.test(u.pathname)) return;   // our pages: /x.html, / or clean /menu
      if(u.pathname===location.pathname&&u.search===location.search) return;
      var k=u.pathname+u.search; if(done[k]) return; done[k]=1; n++;
      fetch(u.href,{credentials:'same-origin',headers:{'Accept':'text/html'}}).catch(function(){});
    }catch(x){}
  }
  document.addEventListener('touchstart',warm,{passive:true,capture:true});
  document.addEventListener('mousedown',warm,{capture:true});
})();
