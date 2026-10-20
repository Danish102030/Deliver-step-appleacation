/* ═══════════════════════════════════════════════════════════════════
   خطوة التوصيل — Smart Product Search (Arabic-aware, instant, cached)
   VERSION 4 (restaurants & cafés in results on the home page) — Include on any page:  <script src="/dssearch.js?v=4" defer></script>
   Open the search overlay from anywhere: DSSearch.open()
   - Loads the product list ONCE, caches it, refreshes quietly in the background.
   - Arabic normalization (tashkeel / alef / ya / ta-marbuta / hamza / Persian letters / digits).
   - Searches the Arabic name, the English name, brand and category. Barcode when the query is digits.
   - Understands typing like "حليب أقل من 5" / "شوكولاتة الأرخص" / "قسم المشروبات".
   - Filters: category chips with counts, sort (cheapest / most expensive / most ordered), price ranges.
   - Nothing found → "did you mean", shorter words, ask for the product on WhatsApp.
   - Every finished search is saved for the admin (words, results, last 4 phone digits, app/web, led to cart).
   - Add-to-cart respects the exact supermarket two-vendor cart shape.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (window.DSSearch) return;

  var URL='https://vjuhxpttssmyomqqomdx.supabase.co';
  var KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MjQxNjAsImV4cCI6MjA5NDUwMDE2MH0.JiGnmOEPPM3dka-KHIm5mEFs7GWb4Amsnp6R57r7Lro';
  var CACHE='qibah_prod_index';
  var POPC='qibah_sm_pop';
  var SM='السوبرماركت';
  var HELP_WA='966560957163';

  var INDEX=[], POP={}, _sb=null, opened=false, timer=null, pushed=false;
  var F={cat:'',price:'',sort:''};            // filters chosen by tapping
  var SHOWN=40;

  /* ── Supabase (reuse the page's client if present) ── */
  function getSB(){
    if(_sb) return _sb;
    try{ _sb=(window.sb&&window.sb.from)?window.sb:(window.supabase&&supabase.createClient(URL,KEY)); }catch(e){ _sb=null; }
    return _sb;
  }

  /* ── Arabic normalization ── */
  function norm(s){
    if(s==null) return '';
    return s.toString()
      .replace(/[\u064B-\u0652\u0670\u0640]/g,'')   // tashkeel + superscript-alef + tatweel
      .replace(/[أإآٱ]/g,'ا')                        // أ إ آ ٱ → ا
      .replace(/[ىی]/g,'ي')                          // ى and Persian ی → ي
      .replace(/ک/g,'ك').replace(/ۀ/g,'ه')            // Persian kaf / heh
      .replace(/ة/g,'ه')                             // ة → ه
      .replace(/ؤ/g,'و')                             // ؤ → و
      .replace(/ئ/g,'ي')                             // ئ → ي
      .replace(/ء/g,'')                              // ء → (remove)
      .replace(/[٠-٩]/g,function(d){return String.fromCharCode(d.charCodeAt(0)-0x0660+48);})
      .replace(/[۰-۹]/g,function(d){return String.fromCharCode(d.charCodeAt(0)-0x06F0+48);})
      .replace(/[^\u0600-\u06FF0-9a-zA-Z.\s]/g,' ')  // drop punctuation (keep decimal point)
      .replace(/\s+/g,' ').trim().toLowerCase();
  }
  function toLatinDigits(s){ return (s||'').toString().replace(/[٠-٩]/g,function(d){return String.fromCharCode(d.charCodeAt(0)-0x0660+48);}).replace(/[۰-۹]/g,function(d){return String.fromCharCode(d.charCodeAt(0)-0x06F0+48);}); }

  // common drink/brand equivalents (Arabic ↔ English + variants) so بيبسي finds Pepsi and vice-versa
  var ALIASES=[['بيبسي','pepsi'],['كوكا','كوكاكولا','coca','cocacola'],['كولا','cola'],['سبرايت','sprite'],['فانتا','fanta'],['ميراندا','ميرندا','ميريندا','mirinda'],['سفن','7up','sevenup'],['مياه','مويه','ماء','water'],['حليب','milk'],['عصير','juice'],['شوكولاته','شوكلت','chocolate'],['جالكسي','galaxy'],['المراعي','almarai'],['نادك','nadec'],['ليز','lays'],['رز','ارز','rice'],['خبز','bread'],['بيض','eggs'],['دجاج','chicken'],['شاي','tea'],['قهوه','coffee'],['سكر','sugar'],['زيت','oil'],['جبنه','cheese']];
  var _AN=null;
  function aliasGroups(){ if(_AN) return _AN; _AN=ALIASES.map(function(g){return g.map(norm).filter(function(x){return x.length>=2;});}); return _AN; }
  function aliasFor(text){ var gs=aliasGroups(),add=''; var words=' '+text+' '; for(var i=0;i<gs.length;i++){ var g=gs[i]; for(var j=0;j<g.length;j++){ if(g[j].length>=3?text.indexOf(g[j])>=0:words.indexOf(' '+g[j]+' ')>=0){ add+=' '+g.join(' '); break; } } } return add; }
  var VOCAB=null, CATS=[];
  function prep(){
    var seen={}; VOCAB={};
    for(var i=0;i<INDEX.length;i++){ var p=INDEX[i];
      p._name=norm(p.name);
      p._n=p._name+' '+norm(p.name_en)+' '+norm(p.brand)+' '+norm(p.category_name);   // search Arabic + English + brand + category
      p._n+=aliasFor(p._n);
      if(p.category_name&&!seen[p.category_name]){ seen[p.category_name]=1; }
      (p._name+' '+norm(p.name_en)).split(' ').forEach(function(w){ if(w.length>=3&&!/^\d/.test(w)) VOCAB[w]=(VOCAB[w]||0)+1; });
    }
    CATS=Object.keys(seen);
  }

  /* ── load index: cache-first, then refresh in the background (robust, multi-tier) ── */
  var loading=false;
  var COLS_FULL='id,name,name_en,price,image_url,category_name,in_stock,brand,barcode';
  var COLS_OLD ='id,name,price,image_url,category_name,in_stock,brand,barcode';
  var COLS_BC='id,name,price,image_url,category_name,in_stock,barcode';
  var COLS_BRAND='id,name,price,image_url,category_name,in_stock,brand';
  var COLS_SAFE='id,name,price,image_url,category_name,in_stock';
  var ATTEMPTS=[[COLS_FULL,true],[COLS_OLD,true],[COLS_BC,true],[COLS_BRAND,true],[COLS_SAFE,true],[COLS_SAFE,false]];
  var PAGE=1000; // Supabase returns at most 1000 rows per request → we page through ALL of them
  function loadIndex(){
    try{ var c=JSON.parse(localStorage.getItem(CACHE)||'null'); if(c&&c.length){ INDEX=c; prep(); } }catch(e){}
    loadPop();
    var sb=getSB(); if(!sb||loading) return; loading=true;
    function done(data){ loading=false; if(data&&data.length){ INDEX=data; prep(); try{ localStorage.setItem(CACHE,JSON.stringify(data)); }catch(e){} } if(opened) doSearch(); }
    function loadAllPages(cols,useFilter,cb){
      var all=[], from=0, first=true;
      function page(){
        var b=sb.from('supermarket_products').select(cols);
        if(useFilter) b=b.or('is_active.is.null,is_active.eq.true');
        b=b.order('id',{ascending:true}).range(from,from+PAGE-1);
        b.then(function(r){
          if(r&&r.error){ cb(first?null:all); return; }
          first=false; var data=(r&&r.data)||[]; all=all.concat(data);
          if(data.length>=PAGE && from<80000){ from+=PAGE; page(); } else cb(all);
        });
      }
      try{ page(); }catch(e){ cb(first?null:all); }
    }
    function tryAt(i){
      if(i>=ATTEMPTS.length){ loading=false; try{ if(window.console) console.warn('[DSSearch] no products loaded'); }catch(e){} if(opened) doSearch(); return; }
      loadAllPages(ATTEMPTS[i][0], ATTEMPTS[i][1], function(all){
        if(all&&all.length){ done(all); } else { tryAt(i+1); }
      });
    }
    tryAt(0);
  }
  // "Most ordered": how often each product was ordered (cached for a day)
  function loadPop(){
    try{ var c=JSON.parse(localStorage.getItem(POPC)||'null'); if(c&&c.t&&c.d){ POP=c.d; if(Date.now()-c.t<20*3600*1000) return; } }catch(e){}
    var sb=getSB(); if(!sb) return;
    try{ sb.rpc('sm_popular').then(function(r){ if(r&&!r.error&&r.data&&typeof r.data==='object'){ POP=r.data; try{ localStorage.setItem(POPC,JSON.stringify({t:Date.now(),d:POP})); }catch(e){} if(opened) doSearch(); } }); }catch(e){}
  }
  function pop(p){ return Number(POP[String(p.id)]||0); }

  /* ── understand what the customer typed: price, sort, category ── */
  var NUM='(\\d+(?:\\.\\d+)?)', CUR='(?:\\s*(?:ريال|رس|ر\\.س|sar|rs|sr))?';
  function parse(q){
    var t=' '+norm(q)+' ', R={min:null,max:null,sort:'',cat:'',parts:[]};
    function take(re,fn){ t=t.replace(re,function(){ var lab=fn.apply(null,arguments); if(lab===false) return arguments[0]; R.parts.push({label:lab,src:arguments[0].trim()}); return ' '; }); }
    take(new RegExp(' (?:بين|من|between|from) '+NUM+CUR+' ?(?:و|الي|لين|to|and|-) ?'+NUM+CUR+'(?= )','g'),function(m,a,b){ a=+a; b=+b; R.min=Math.min(a,b); R.max=Math.max(a,b); return '💰 '+R.min+' – '+R.max+' ريال'; });
    take(new RegExp(' (?:اقل من|ارخص من|تحت|دون|حتي|under|below|less than|<) ?'+NUM+CUR+'(?= )','g'),function(m,a){ R.max=+a; return '💰 أقل من '+(+a)+' ريال'; });
    take(new RegExp(' (?:اكثر من|اغلي من|فوق|over|above|more than|>) ?'+NUM+CUR+'(?= )','g'),function(m,a){ R.min=+a; return '💰 أكثر من '+(+a)+' ريال'; });
    take(/ (?:الارخص|ارخص|الاقل سعر|اقل سعر|رخيص|cheapest|cheap)(?= )/g,function(){ R.sort='cheap'; return '↕ الأرخص'; });
    take(/ (?:الاغلي|اغلي|الاعلي سعر|most expensive|expensive)(?= )/g,function(){ R.sort='exp'; return '↕ الأغلى'; });
    take(/ (?:الاكثر طلبا|الاكثر مبيعا|الاشهر|الاكثر شعبيه|popular|best seller|bestseller)(?= )/g,function(){ R.sort='pop'; return '🔥 الأكثر طلباً'; });
    take(/ (?:قسم|فئه|category) ((?:[^ ]+ ?){1,4})/g,function(m,ph){
      var w=ph.trim().split(' ');
      for(var n=w.length;n>0;n--){ var c=catFind(w.slice(0,n).join(' ')); if(c){ R.cat=c; var rest=w.slice(n).join(' '); R._rest=rest; return '📂 '+c; } }
      return false; });
    if(R._rest) t+=' '+R._rest+' ';
    // a category name typed exactly as it is (e.g. "مشروب غازي")
    if(!R.cat){ CATS.slice().sort(function(a,b){ return b.length-a.length; }).some(function(c){ var cn=norm(c); if(cn.length<4) return false; var i=t.indexOf(' '+cn+' '); if(i<0) return false; t=t.slice(0,i)+' '+t.slice(i+cn.length+1); R.cat=c; R.parts.push({label:'📂 '+c,src:cn}); return true; }); }
    var FILL={'ابي':1,'ابغي':1,'ابغا':1,'ودي':1,'عندكم':1,'فيه':1,'ريال':1,'رس':1,'في':1,'من':1,'و':1,'ال':1,'sar':1,'the':1,'and':1};
    R.text=t.split(' ').filter(function(w){ return w&&!FILL[w]; }).join(' ');
    return R;
  }
  function catFind(ph){ ph=norm(ph); if(ph.length<2) return null;
    var hit=CATS.find(function(c){ return norm(c)===ph; })||(ph.length>=3?CATS.find(function(c){ return norm(c).indexOf(ph)>=0; }):null);
    return hit||null; }

  /* ── search + ranking (all matches; filters are applied after) ── */
  function match(text){
    var raw=(text||'').trim(); if(!raw) return [];
    var digits=toLatinDigits(raw); var isBarcode=/^\d{5,}$/.test(digits);
    var nq=norm(raw); var tokens=nq.split(' ').filter(Boolean);
    var out=[];
    for(var k=0;k<INDEX.length;k++){
      var p=INDEX[k];
      if(isBarcode){ if(p.barcode&&String(p.barcode).indexOf(digits)>=0) out.push({p:p,s:100}); continue; }
      if(!tokens.length) continue;
      var hay=p._n; var ok=true;
      for(var t=0;t<tokens.length;t++){ if(hay.indexOf(tokens[t])<0){ ok=false; break; } }
      if(!ok) continue;
      var nm=p._name, s;
      if(nm===nq) s=100;
      else if(nm.indexOf(nq)===0) s=85;
      else if(hay.split(' ').some(function(w){return w.indexOf(tokens[0])===0;})) s=65;
      else s=45;
      s+=Math.min(12,pop(p)/2);                 // products people order more come first
      if(p.in_stock===false) s-=15;
      out.push({p:p,s:s});
    }
    out.sort(function(a,b){ return b.s-a.s || (a.p.name||'').length-(b.p.name||'').length; });
    return out.map(function(x){return x.p;});
  }
  function search(q){ return match(q).slice(0,60); }   // kept for other pages

  // full pipeline: typed words + understood parts + tapped filters
  var PRICE={lt5:[null,5],'5-10':[5,10],'10-25':[10,25],gt25:[25,null]};
  function run(q){
    var R=parse(q), base;
    if(R.text) base=match(R.text);
    else if(R.cat||R.min!=null||R.max!=null||R.sort) base=INDEX.slice();
    else base=[];
    var mn=R.min, mx=R.max;
    if(F.price&&PRICE[F.price]){ var pr=PRICE[F.price]; if(pr[0]!=null) mn=Math.max(mn||0,pr[0]); if(pr[1]!=null) mx=mx==null?pr[1]:Math.min(mx,pr[1]); }
    var inPrice=base.filter(function(p){ var v=Number(p.price)||0; return (mn==null||v>=mn)&&(mx==null||v<=mx); });
    var counts={}; inPrice.forEach(function(p){ var c=p.category_name||''; if(c) counts[c]=(counts[c]||0)+1; });
    var cat=R.cat||F.cat;
    var list=cat?inPrice.filter(function(p){ return p.category_name===cat; }):inPrice;
    var sort=F.sort||R.sort;
    var num=function(p){ return Number(p.price)||0; };
    if(sort==='cheap') list=list.slice().sort(function(a,b){ return num(a)-num(b); });
    else if(sort==='exp') list=list.slice().sort(function(a,b){ return num(b)-num(a); });
    else if(sort==='pop') list=list.slice().sort(function(a,b){ return pop(b)-pop(a); });
    else if(!R.text) list=list.slice().sort(function(a,b){ return pop(b)-pop(a); });
    return {R:R,list:list,counts:counts,total:inPrice.length,cat:cat};
  }
  // "did you mean": closest known word for each typed word (1 letter off; 2 for long words)
  function lev(a,b){ if(Math.abs(a.length-b.length)>2) return 9; var d=[],i,j; for(i=0;i<=a.length;i++){ d[i]=[i]; } for(j=0;j<=b.length;j++) d[0][j]=j;
    for(i=1;i<=a.length;i++) for(j=1;j<=b.length;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); return d[a.length][b.length]; }
  function suggest(text){
    var words=norm(text).split(' ').filter(Boolean), changed=false;
    var fixed=words.map(function(w){
      if(w.length<4||/^\d/.test(w)||(VOCAB&&VOCAB[w])) return w;
      var best=null,bd=9,bc=0, lim=w.length>=7?2:1;
      for(var k in VOCAB){ if(Math.abs(k.length-w.length)>lim) continue; var d=lev(w,k); if(d<bd||(d===bd&&VOCAB[k]>bc)){ bd=d; best=k; bc=VOCAB[k]; } }
      if(best&&bd<=lim){ changed=true; return best; } return w; });
    return changed?fixed.join(' '):'';
  }

  /* ── tell the admin what was searched (once per finished search) ── */
  var LOG={q:'',id:null,timer:null,pend:null,marked:false};
  function logNow(){
    clearTimeout(LOG.timer); var pnd=LOG.pend; LOG.pend=null; if(!pnd) return Promise.resolve(LOG.id);
    var sb=getSB(); if(!sb) return Promise.resolve(null);
    var phone=''; try{ phone=(JSON.parse(localStorage.getItem('ds_customer')||'{}')||{}).phone||''; }catch(e){}
    var dev=(window.DS_APP_VERSION||(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()))?'app':'web';
    return sb.rpc('log_search',{p_q:pnd.q,p_results:pnd.n,p_source:'search',p_phone:phone,p_device:dev,p_cat:pnd.cat||null})
      .then(function(r){ if(r&&!r.error&&r.data) LOG.id=r.data; return LOG.id; },function(){ return null; });
  }
  function logLater(q,n,cat){
    var key=norm(q)+'|'+(cat||''); if(norm(q).length<2) return;
    if(key===LOG.q&&!LOG.pend) return;
    LOG.q=key; LOG.id=null; LOG.marked=false; LOG.pend={q:q,n:n,cat:cat};
    clearTimeout(LOG.timer); LOG.timer=setTimeout(logNow,1500);
  }
  function logCart(){
    if(LOG.marked) return; LOG.marked=true;
    logNow().then(function(id){ var sb=getSB(); if(id&&sb){ try{ sb.rpc('search_mark_cart',{p_id:id}).then(function(){},function(){}); }catch(e){} } });
  }

  /* ── cart (exact supermarket two-vendor shape) ── */
  function vendorOf(i){ return i.vendor||i.restaurant||SM; }
  function cartArr(){ try{ return JSON.parse(localStorage.getItem('qibah_cart')||'[]'); }catch(e){ return []; } }
  function smBlocked(){ var s=cartArr(); var r={}; s.forEach(function(i){ var v=vendorOf(i); if(v!==SM) r[v]=1; }); return Object.keys(r).length>=2; }
  function qtyOf(id){ var s=cartArr(); for(var i=0;i<s.length;i++){ if(String(s[i].id)===String(id)&&vendorOf(s[i])===SM) return s[i].qty||0; } return 0; }
  function addQty(p,delta){
    if(delta>0&&smBlocked()){ toast('🛍️ يمكنك الطلب من متجرين فقط في نفس السلة'); return; }
    var cart=cartArr(), idx=-1;
    for(var i=0;i<cart.length;i++){ if(String(cart[i].id)===String(p.id)&&vendorOf(cart[i])===SM){ idx=i; break; } }
    if(idx>=0){ cart[idx].qty=Math.max(0,(cart[idx].qty||0)+delta); if(cart[idx].qty<=0) cart.splice(idx,1); }
    else if(delta>0){ cart.push({id:p.id,name:p.name,price:p.price,qty:1,image:p.image_url||p.image||'',vendor:SM,vendor_wa:'',vendor_fee:null}); }
    try{ localStorage.setItem('qibah_cart',JSON.stringify(cart)); }catch(e){}
    if(window.updateCart){ try{ window.updateCart(); }catch(e){} }
    if(delta>0){ try{var _h=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Haptics;_h?_h.impact({style:'MEDIUM'}):(navigator.vibrate&&navigator.vibrate(40));}catch(e){} logCart(); }
    updateResultQty(p.id);
  }

  /* ── UI ── */
  var el={}; var RIYAL='<svg viewBox="539 350 402 448" width="11" height="11" style="vertical-align:-1px;display:inline-block" fill="currentColor"><path d="M772.564 422.262C788.654 404.2 798.543 396.091 817.965 385.839V686.607L772.564 695.988V422.262Z"/><path d="M917.627 573.474C927.039 553.607 928.147 544.777 930.667 524.396L582.653 599.963C574.401 618.346 571.744 628.622 570.472 646.872L917.627 573.474Z"/><path d="M691.174 726.341C705.016 709.233 719.411 687.71 729.377 670.051L561.514 706.435C553.261 724.818 550.605 735.094 549.333 753.344L691.174 726.341Z"/><path d="M683.976 396.876C700.067 378.814 709.955 370.705 729.377 360.453V671.154L683.976 680.536V396.876Z"/></svg>';

  function css(){
    var s=document.createElement('style');
    s.textContent=
    '#dss-ov{position:fixed;inset:0;z-index:99999;background:#f5f5f5;display:none;flex-direction:column;max-width:480px;margin:0 auto;font-family:"Tajawal",sans-serif;direction:rtl}'+
    '#dss-ov.on{display:flex}'+
    '.dss-top{background:linear-gradient(135deg,#9d174d,#be185d);padding:calc(10px + env(safe-area-inset-top)) 12px 12px;display:flex;align-items:center;gap:9px}'+
    '.dss-back{background:rgba(255,255,255,.2);border:none;color:#fff;width:38px;height:38px;border-radius:11px;font-size:20px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center}'+
    '.dss-field{flex:1;background:#fff;border-radius:12px;display:flex;align-items:center;gap:8px;padding:0 12px;height:42px}'+
    '.dss-field .dss-ic{color:#be185d;flex-shrink:0}'+
    '.dss-field input{flex:1;border:none;outline:none;font-family:inherit;font-size:16px;background:transparent;color:#1f1f1f;direction:rtl;min-width:0}'+
    '.dss-clear{background:none;border:none;color:#9ca3af;font-size:18px;cursor:pointer;display:none}'+
    '#dss-in::-webkit-search-cancel-button,#dss-in::-webkit-search-decoration{-webkit-appearance:none;appearance:none;display:none}'+
    '.dss-bars{background:#f5f5f5;padding:8px 0 2px;border-bottom:1px solid #f0e4e9}'+
    '.dss-bars:empty{display:none}'+
    '.dss-row{display:flex;gap:6px;overflow-x:auto;padding:0 12px 6px;scrollbar-width:none}.dss-row::-webkit-scrollbar{display:none}'+
    '.dss-c{flex-shrink:0;background:#fff;border:1.5px solid #f0e4e9;color:#374151;font-family:inherit;font-size:12.5px;font-weight:700;padding:6px 12px;border-radius:20px;cursor:pointer;white-space:nowrap}'+
    '.dss-c b{font-weight:800;color:#9ca3af;margin-right:3px}'+
    '.dss-c.on{background:#1f1f1f;border-color:#1f1f1f;color:#fff}.dss-c.on b{color:#d1d5db}'+
    '.dss-c.u{background:#eef2ff;border-color:#c7d2fe;color:#3730a3}'+
    '.dss-c.f{border-color:#be185d;color:#be185d}'+
    '.dss-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 12px calc(24px + env(safe-area-inset-bottom))}'+
    '.dss-hint{text-align:center;color:#9ca3af;padding:36px 20px;font-size:13.5px;line-height:1.9}'+
    '.dss-hint .big{font-size:44px;display:block;margin-bottom:10px;opacity:.5}'+
    '.dss-hint b{color:#1f1f1f;font-size:16px}'+
    '.dss-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px}'+
    '.dss-chip{background:#fff;border:1px solid #f0e4e9;color:#be185d;font-family:inherit;font-size:12.5px;font-weight:700;padding:7px 14px;border-radius:20px;cursor:pointer}'+
    '.dss-dym{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:12px;padding:10px 12px;margin:4px 0 10px;font-size:13.5px;font-weight:700;cursor:pointer}'+
    '.dss-dym u{color:#be185d}'+
    '.dss-ask{background:#fff;border:1px solid #f0e4e9;border-radius:16px;padding:14px;margin:6px 4px 0;text-align:center}'+
    '.dss-ask a{display:block;background:#16a34a;color:#fff;text-decoration:none;border-radius:12px;padding:12px;font-weight:800;margin-top:10px}'+
    '.dss-count{font-size:11.5px;color:#6b7280;font-weight:600;padding:4px 4px 8px}'+
    '.dss-item{background:#fff;border-radius:14px;border:.5px solid #f0e4e9;display:flex;align-items:center;gap:10px;padding:8px;margin-bottom:8px}'+
    '.dss-img{width:56px;height:56px;border-radius:10px;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border:.5px solid #f5f5f5}'+
    '.dss-img img{width:100%;height:100%;object-fit:contain}'+
    '.dss-img .ph{font-size:24px;color:#e5c9d5}'+
    '.dss-info{flex:1;min-width:0}'+
    '.dss-name{font-size:13px;font-weight:700;color:#1f1f1f;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'+
    '.dss-name mark{background:#fce7f3;color:#be185d;padding:0 1px;border-radius:3px}'+
    '.dss-cat{font-size:10.5px;color:#9ca3af;margin-top:2px}'+
    '.dss-hot{color:#ea580c;font-weight:700}'+
    '.dss-price{font-size:13px;font-weight:800;color:#9d174d;margin-top:3px}'+
    '.dss-oos{font-size:10px;color:#dc2626;font-weight:700}'+
    '.dss-add{width:34px;height:34px;background:#be185d;color:#fff;border:none;border-radius:9px;font-size:18px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center}'+
    '.dss-add:active{transform:scale(.92)}'+
    '.dss-qty{display:flex;align-items:center;gap:2px;flex-shrink:0}'+
    '.dss-qb{width:28px;height:28px;border:none;border-radius:7px;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center}'+
    '.dss-qm{background:#fce7f3;color:#be185d}.dss-qp{background:#be185d;color:#fff}'+
    '.dss-qn{font-size:13px;font-weight:800;min-width:20px;text-align:center}'+
    '.dss-more{display:block;margin:6px auto 14px;background:#fff;border:1.5px solid #be185d;color:#be185d;border-radius:22px;padding:10px 26px;font-family:inherit;font-weight:800;font-size:13px;cursor:pointer}'+
    '.dss-sh-ov{position:fixed;inset:0;z-index:100001;background:rgba(15,23,42,.45);display:none;align-items:flex-end;justify-content:center}'+
    '.dss-sh-ov.on{display:flex}'+
    '.dss-sh{background:#fff;width:100%;max-width:480px;border-radius:22px 22px 0 0;padding:10px 16px calc(18px + env(safe-area-inset-bottom));direction:rtl;font-family:"Tajawal",sans-serif;max-height:86vh;overflow-y:auto}'+
    '.dss-grab{width:42px;height:5px;border-radius:3px;background:#d1d5db;margin:0 auto 10px}'+
    '.dss-sh h3{font-size:19px;font-weight:800;margin:0 0 4px}'+
    '.dss-lbl{font-size:13px;font-weight:800;margin:14px 0 8px}'+
    '.dss-seg{display:flex;flex-wrap:wrap;gap:7px}'+
    '.dss-seg button{border:1.5px solid #e5e7eb;background:#fff;border-radius:20px;padding:8px 13px;font-family:inherit;font-size:13px;font-weight:700;color:#374151;cursor:pointer}'+
    '.dss-seg button.on{border-color:#be185d;background:#fdf2f8;color:#be185d}'+
    '.dss-go{display:block;width:100%;border:none;border-radius:14px;padding:13px;font-family:inherit;font-weight:800;font-size:15px;margin-top:16px;cursor:pointer;background:#be185d;color:#fff}'+
    '.dss-clr{display:block;width:100%;border:none;background:none;color:#6b7280;font-family:inherit;font-size:13px;margin-top:8px;cursor:pointer}'+
    '.dss-toast{position:fixed;bottom:calc(24px + env(safe-area-inset-bottom));right:50%;transform:translateX(50%) translateY(20px);background:#1f1f1f;color:#fff;font-family:"Tajawal",sans-serif;font-size:13px;padding:11px 20px;border-radius:22px;white-space:nowrap;opacity:0;transition:all .3s;z-index:100002;pointer-events:none}'+
    '.dss-toast.on{opacity:1;transform:translateX(50%) translateY(0)}'+
    '.dss-vh{font-size:13px;font-weight:800;color:#1f1f1f;padding:4px 4px 8px;display:flex;align-items:center;gap:6px}.dss-vh b{color:#9ca3af;font-size:11.5px}'+
    '.dss-vrow{display:flex;gap:9px;overflow-x:auto;padding:0 2px 10px;margin:0 -2px 6px;scrollbar-width:none;border-bottom:1px solid #f0e4e9}.dss-vrow::-webkit-scrollbar{display:none}'+
    '.dss-v{flex:0 0 128px;background:#fff;border:.5px solid #f0e4e9;border-radius:14px;overflow:hidden;cursor:pointer;position:relative}'+
    '.dss-v:active{transform:scale(.97)}'+
    '.dss-vi{height:74px;background:linear-gradient(135deg,#9d174d,#be185d);display:flex;align-items:center;justify-content:center;font-size:30px;position:relative}'+
    '.dss-vi img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}'+
    '.dss-vn{font-size:12.5px;font-weight:800;color:#1f1f1f;padding:7px 8px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '.dss-vs{font-size:10.5px;font-weight:700;color:#15803d;padding:2px 8px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dss-vs.off{color:#b91c1c}.dss-vs.soon{color:#b45309}'+
    '.dss-nop{background:#fff;border:1px dashed #f0e4e9;border-radius:12px;padding:10px 12px;color:#9ca3af;font-size:12.5px;text-align:center;margin-top:4px}';
    document.head.appendChild(s);
  }

  function build(){
    css();
    var ov=document.createElement('div'); ov.id='dss-ov';
    ov.innerHTML=
      '<div class="dss-top">'+
        '<button class="dss-back" id="dss-back" aria-label="رجوع">&#8594;</button>'+
        '<div class="dss-field">'+
          '<svg class="dss-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>'+
          '<input id="dss-in" type="search" placeholder="ابحث: حليب، بيبسي أقل من 5، الأرخص…" autocomplete="off" enterkeyhint="search"/>'+
          '<button class="dss-clear" id="dss-clear" aria-label="مسح">&times;</button>'+
        '</div>'+
      '</div>'+
      '<div class="dss-bars" id="dss-bars"></div>'+
      '<div class="dss-body" id="dss-body"></div>';
    document.body.appendChild(ov);
    var sh=document.createElement('div'); sh.className='dss-sh-ov'; sh.id='dss-sh-ov';
    sh.addEventListener('click',function(e){ if(e.target===sh) closeSheet(); });
    document.body.appendChild(sh);
    var toastEl=document.createElement('div'); toastEl.className='dss-toast'; toastEl.id='dss-toast';
    document.body.appendChild(toastEl);
    el.ov=ov; el.in=document.getElementById('dss-in'); if(hasVen()) el.in.placeholder='ابحث عن مطعم، قهوة أو منتج…'; el.body=document.getElementById('dss-body'); el.bars=document.getElementById('dss-bars');
    el.clear=document.getElementById('dss-clear'); el.toast=toastEl; el.sh=sh;
    document.getElementById('dss-back').onclick=function(){ close(); };
    el.clear.onclick=function(){ el.in.value=''; el.clear.style.display='none'; F={cat:'',price:'',sort:''}; doSearch(); el.in.focus(); };
    el.in.addEventListener('input',function(){
      el.clear.style.display=el.in.value?'block':'none';
      F.cat=''; SHOWN=40;
      clearTimeout(timer); timer=setTimeout(doSearch,110);
    });
    el.in.addEventListener('keydown',function(e){ if(e.key==='Enter'){ logNow(); try{ el.in.blur(); }catch(x){} } });
    el.bars.addEventListener('click',onBar);
    el.body.addEventListener('click',onBody);
    window.addEventListener('popstate',function(){ if(opened) close(true); });
    empty();
  }

  var POPULAR=['حليب','خبز','بيض','أرز','ماء','دجاج','بيبسي','شاي','قهوة','سكر'];
  // ── Restaurants & cafés in the results (home page only: it sets window.DSVendors) ──
  var VSYN={ds_store:'متجر خطوه التوصيل شحن رصيد سوا stc موبايلي mobily زين zain بطاقه كرت شاحن شواحن كيبل كيابل سماعه سماعات كفر كفرات حمايه شاشه جوال جوالات اكسسوارات باور بانك',burger:'برجر برقر برغر burger',shawarma:'شاورما شاورمه شورما shawarma',coffee:'كوفي قهوه كافيه كافي coffee cafe لاتيه كابتشينو اسبريسو موكا',pizza:'بيتزا pizza',
    broasted:'بروستد بروست broasted',saudi:'مندي كبسه مضغوط بخاري مشويات شعبي',dessert:'حلويات حلا كيك',juice:'عصير عصيرات',bakery:'مخبوزات معجنات فطاير',icecream:'ايس كريم ايسكريم',
    'buffet-breakfast':'فطور افطار فول تميس فلافل شكشوكه بوفيه','buffet-lunch':'غدا غداء بوفيه','buffet-dinner':'عشا عشاء بوفيه','buffet-mixed':'بوفيه'};
  var VICON={ds_store:'📱',burger:'🍔',shawarma:'🥙',coffee:'☕',pizza:'🍕',broasted:'🍗',saudi:'🍚',dessert:'🍰',juice:'🥤','buffet-breakfast':'🍳'};
  function hasVen(){ return typeof window.DSVendors==='function'; }
  function vendors(text){
    if(!hasVen()) return [];
    var list=[]; try{ list=window.DSVendors()||[]; }catch(e){ return []; }
    var words=norm(text).split(' ').filter(function(w){ return w.length>=2; }); if(!words.length) return [];
    var out=[];
    list.forEach(function(v){ if(!v||v.is_active===false) return;
      var hay=norm((v.name||'')+' '+(v.name_ar||'')+' '+(VSYN[v.category]||''));
      if(words.every(function(w){ return hay.indexOf(w)>=0; })){
        var st=null; try{ st=window.DSVendorStatus?window.DSVendorStatus(v):null; }catch(e){}
        out.push({v:v,st:st,nameHit:norm(v.name||'').indexOf(words[0])>=0}); } });
    out.sort(function(a,b){ return ((a.st&&a.st.rank)||0)-((b.st&&b.st.rank)||0)||(b.nameHit?1:0)-(a.nameHit?1:0); });
    return out.slice(0,12);
  }
  function vendorsHTML(V){
    if(!V.length) return '';
    return '<div class="dss-vh">🍽️ مطاعم وكافيهات <b>'+V.length+'</b></div><div class="dss-vrow">'+V.map(function(x){ var v=x.v, st=x.st;
      return '<div class="dss-v" data-v="'+esc(v.id)+'"><div class="dss-vi">'+(VICON[v.category]||'🍽️')+(v.banner_url?'<img src="'+esc(v.banner_url)+'" alt="" loading="lazy" onerror="this.remove()"/>':'')+'</div>'+
        '<div class="dss-vn">'+esc(v.name)+'</div><div class="dss-vs '+(st?esc(st.cls||''):'')+'">'+(st?esc(st.pill):'')+'</div></div>'; }).join('')+'</div>';
  }
  function chipsHTML(list){ return '<div class="dss-chips">'+list.map(function(w){return '<button class="dss-chip" data-w="'+esc(w)+'">'+esc(w)+'</button>';}).join('')+'</div>'; }
  function empty(){
    el.bars.innerHTML='';
    if(hasVen()){ el.body.innerHTML='<div class="dss-hint"><span class="big">🔎</span>ابحث عن مطعم، كوفي، أو أي منتج من السوبرماركت'+chipsHTML(['برجر','شاورما','قهوة','بيتزا','فطور','حليب','بيبسي','خبز'])+'</div>'; return; }
    el.body.innerHTML='<div class="dss-hint"><span class="big">🛒</span>ابحث في أكثر من '+(INDEX.length>500?Math.floor(INDEX.length/100)*100:'١٠٠٠')+' منتج من السوبرماركت<br/>اكتب اسم المنتج أو جرّب: <b style="font-size:13.5px;color:#be185d">حليب أقل من 10</b>'+chipsHTML(POPULAR)+'</div>';
  }

  function esc(s){ return (s==null?'':s).toString().replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function highlight(name,q){
    var nq=norm(q).split(' ').filter(function(t){ return t.length>=2; }); var out=esc(name); if(!nq.length) return out;
    try{
      var re=new RegExp('('+nq.map(function(t){return t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ا/g,'[اأإآ]').replace(/ه/g,'[هة]').replace(/ي/g,'[يىی]');}).join('|')+')','gi');
      out=esc(name).replace(re,'<mark>$1</mark>');
    }catch(e){}
    return out;
  }

  var LAST=null;
  function doSearch(){
    var q=el.in.value;
    if(!q.trim()){ empty(); return; }
    if(!INDEX.length){
      el.bars.innerHTML='';
      el.body.innerHTML=vendorsHTML(vendors(q))+'<div class="dss-hint"><span class="big">⏳</span>جاري تحميل المنتجات...<br/>لحظة من فضلك</div>';
      loadIndex();
      return;
    }
    var r=LAST=run(q), R=r.R, list=r.list, V=(R.min==null&&R.max==null&&!F.cat&&!F.price)?vendors(R.text||q):[];
    logLater(q,list.length+V.length,r.cat);
    if(!list.length&&V.length){ renderBars(r,true); el.body.innerHTML=vendorsHTML(V)+'<div class="dss-nop">لا توجد منتجات سوبرماركت بهذا الاسم</div>'; el.body.scrollTop=0; return; }
    if(!list.length){ renderBars(r,!(F.cat||F.price||F.sort)); renderNone(q,r); return; }
    renderBars(r);
    var html=vendorsHTML(V)+'<div class="dss-count">'+(V.length?'🛒 من السوبرماركت · ':'')+list.length+' نتيجة</div>';
    var show=list.slice(0,SHOWN), words=R.text||'';
    for(var i=0;i<show.length;i++){
      var p=show[i], qn=qtyOf(p.id), oos=(p.in_stock===false), hot=pop(p)>=5;
      html+='<div class="dss-item" data-id="'+esc(p.id)+'">'+
        '<div class="dss-img">'+(p.image_url?'<img src="'+esc(p.image_url)+'" alt="" loading="lazy"/>':'<span class="ph">🛍️</span>')+'</div>'+
        '<div class="dss-info">'+
          '<div class="dss-name">'+highlight(p.name,words)+'</div>'+
          '<div class="dss-cat">'+esc(p.category_name||'')+(hot?' · <span class="dss-hot">🔥 مطلوب</span>':'')+(oos?' · <span class="dss-oos">نفذت الكمية</span>':'')+'</div>'+
          (oos?'':'<div class="dss-price">'+RIYAL+' '+Number(p.price||0).toFixed(2)+'</div>')+
        '</div>'+
        (oos?'':'<div id="dss-ctrl-'+esc(p.id)+'">'+ctrlHTML(p,qn)+'</div>')+
      '</div>';
    }
    if(list.length>SHOWN) html+='<button class="dss-more" data-more="1">عرض المزيد ('+(list.length-SHOWN)+')</button>';
    el.body.innerHTML=html;
    if(SHOWN<=40) el.body.scrollTop=0;
  }
  function renderBars(r,partsOnly){
    var R=r.R, cats=Object.keys(r.counts).sort(function(a,b){ return r.counts[b]-r.counts[a]; });
    var h='';
    if(R.parts.length) h+='<div class="dss-row">'+R.parts.map(function(p,i){ return '<button class="dss-c u" data-part="'+i+'">'+esc(p.label)+' ✕</button>'; }).join('')+'</div>';
    if(cats.length>1||r.cat){
      h+='<div class="dss-row"><button class="dss-c'+(r.cat?'':' on')+'" data-cat="">الكل <b>'+r.total+'</b></button>'+
        cats.slice(0,12).map(function(c){ return '<button class="dss-c'+(c===r.cat?' on':'')+'" data-cat="'+esc(c)+'">'+esc(c)+' <b>'+r.counts[c]+'</b></button>'; }).join('')+'</div>';
    }
    if(partsOnly){ el.bars.innerHTML=R.parts.length?'<div class="dss-row">'+R.parts.map(function(p,i){ return '<button class="dss-c u" data-part="'+i+'">'+esc(p.label)+' ✕</button>'; }).join('')+'</div>':''; return; }
    var nF=(F.sort?1:0)+(F.price?1:0)+(F.cat?1:0);
    h+='<div class="dss-row"><button class="dss-c f" data-sheet="1">⚙ فلترة'+(nF?' ('+nF+')':'')+'</button>'+
      [['cheap','الأرخص'],['exp','الأغلى'],['pop','🔥 الأكثر طلباً']].map(function(s){ return '<button class="dss-c'+(F.sort===s[0]?' on':'')+'" data-sort="'+s[0]+'">'+s[1]+'</button>'; }).join('')+
      [['lt5','أقل من 5'],['5-10','5 – 10'],['10-25','10 – 25'],['gt25','أكثر من 25']].map(function(s){ return '<button class="dss-c'+(F.price===s[0]?' on':'')+'" data-price="'+s[0]+'">'+s[1]+'</button>'; }).join('')+'</div>';
    el.bars.innerHTML=h;
  }
  function renderNone(q,r){
    var R=r.R, text=R.text||norm(q), dym=suggest(text), words=text.split(' ').filter(function(w){ return w.length>=2; });
    var h='<div class="dss-hint" style="padding-top:22px"><span class="big">🔍</span><b>ما لقينا "'+esc(q)+'"</b>';
    if(dym){ var n2=match(dym).length; if(n2) h='<div class="dss-dym" data-w="'+esc(dym)+'">هل تقصد: <u>'+esc(dym)+'</u> ('+n2+' منتج)</div>'+h; }
    if(F.price||F.cat||r.cat||R.min!=null||R.max!=null){ h+='<br/>جرّب بدون الفلترة'; }
    var alts=[]; if(words.length>1){ var want={}; words.forEach(function(w){ want[w]=1; });   // show the customer's own spelling
      q.trim().split(/\s+/).forEach(function(w){ var nw=norm(w); if(nw.length>=2&&want[nw]){ delete want[nw]; var n=match(nw).length; if(n) alts.push([w,n]); } }); }
    if(alts.length) h+='<br/>جرّب كلمة أقصر:<div class="dss-chips">'+alts.map(function(a){ return '<button class="dss-chip" data-w="'+esc(a[0])+'">'+esc(a[0])+' ('+a[1]+')</button>'; }).join('')+'</div>';
    h+='</div>';
    h+='<div class="dss-ask"><div style="font-weight:800">تبي نوفر لك هذا المنتج؟</div><div style="color:#6b7280;font-size:12.5px;margin-top:3px">أرسل لنا اسمه وبنحاول نضيفه قريباً</div>'+
      '<a target="_blank" rel="noopener" href="https://api.whatsapp.com/send?phone='+HELP_WA+'&text='+encodeURIComponent('السلام عليكم، أبحث عن منتج في السوبرماركت: '+q+' — هل يمكن توفيره؟')+'">اطلب المنتج عبر واتساب</a></div>';
    h+='<div class="dss-hint" style="padding:16px 0 0">عمليات بحث شائعة'+chipsHTML(POPULAR.slice(0,6))+'</div>';
    el.body.innerHTML=h;
  }
  function ctrlHTML(p,qn){
    if(qn>0) return '<div class="dss-qty"><button class="dss-qb dss-qm" data-a="-1" data-id="'+esc(p.id)+'">−</button><span class="dss-qn" id="dss-qn-'+esc(p.id)+'">'+qn+'</span><button class="dss-qb dss-qp" data-a="1" data-id="'+esc(p.id)+'">+</button></div>';
    return '<button class="dss-add" data-a="1" data-id="'+esc(p.id)+'" aria-label="أضف">+</button>';
  }
  function setQuery(w){ el.in.value=w; el.clear.style.display='block'; F.cat=''; SHOWN=40; doSearch(); }
  function onBody(ev){
    var vv=ev.target.closest('[data-v]'); if(vv){ ev.stopPropagation(); logNow(); var vid=vv.getAttribute('data-v'), isStore=false; try{ (window.DSVendors()||[]).forEach(function(x){ if(x&&String(x.id)===vid&&x.category==='ds_store') isStore=true; }); }catch(e){}
      window.location.href=isStore?'/shop':'/menu?id='+encodeURIComponent(vid); return; }
    var b=ev.target.closest('[data-a],[data-w],[data-more]'); if(!b) return;
    ev.stopPropagation();
    if(b.hasAttribute('data-a')){ var id=b.getAttribute('data-id'), delta=parseInt(b.getAttribute('data-a'),10);
      var p=INDEX.find(function(x){return String(x.id)===String(id);}); if(p) addQty(p,delta); return; }
    if(b.hasAttribute('data-more')){ SHOWN+=40; doSearch(); return; }
    setQuery(b.getAttribute('data-w'));
  }
  function onBar(ev){
    var b=ev.target.closest('button'); if(!b) return;
    if(b.hasAttribute('data-part')){ dropPart(+b.getAttribute('data-part')); return; }
    if(b.hasAttribute('data-cat')){ F.cat=b.getAttribute('data-cat'); }
    else if(b.hasAttribute('data-sort')){ var s=b.getAttribute('data-sort'); F.sort=F.sort===s?'':s; }
    else if(b.hasAttribute('data-price')){ var pr=b.getAttribute('data-price'); F.price=F.price===pr?'':pr; }
    else if(b.hasAttribute('data-sheet')){ openSheet(); return; }
    SHOWN=40; doSearch();
  }
  // ✕ on an understood part removes those words from the box (works with أ/ا, ة/ه, ى/ي either way)
  function loose(src){ return src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ا/g,'[اأإآٱ]').replace(/ه/g,'[هة]').replace(/ي/g,'[يىی]').replace(/و/g,'[وؤ]').replace(/ /g,'\\s+'); }
  function dropPart(i){
    var R=parse(el.in.value), p=R.parts[i]; if(!p) return;
    var v=el.in.value.replace(new RegExp(loose(p.src),'i'),' ').replace(/\s+/g,' ').trim();
    el.in.value=v; el.clear.style.display=v?'block':'none'; SHOWN=40; doSearch();
  }
  // ⚙ فلترة sheet
  function openSheet(){
    var r=LAST||run(el.in.value), cats=Object.keys(r.counts).sort(function(a,b){ return r.counts[b]-r.counts[a]; });
    var seg=function(name,opts,val){ return '<div class="dss-seg" data-g="'+name+'">'+opts.map(function(o){ return '<button data-v="'+esc(o[0])+'" class="'+(o[0]===val?'on':'')+'">'+o[1]+'</button>'; }).join('')+'</div>'; };
    el.sh.innerHTML='<div class="dss-sh" role="dialog" aria-label="فلترة"><div class="dss-grab"></div><h3>فلترة النتائج</h3>'+
      '<div class="dss-lbl">ترتيب</div>'+seg('sort',[['','الأنسب'],['cheap','الأرخص'],['exp','الأغلى'],['pop','🔥 الأكثر طلباً']],F.sort)+
      '<div class="dss-lbl">السعر</div>'+seg('price',[['','الكل'],['lt5','أقل من 5'],['5-10','5 – 10'],['10-25','10 – 25'],['gt25','أكثر من 25']],F.price)+
      (cats.length?'<div class="dss-lbl">القسم</div>'+seg('cat',[['','الكل']].concat(cats.map(function(c){ return [c,esc(c)+' ('+r.counts[c]+')']; })),F.cat||r.cat||''):'')+
      '<button class="dss-go" id="dss-go">عرض النتائج</button><button class="dss-clr" id="dss-clr">مسح الفلترة</button></div>';
    Array.prototype.forEach.call(el.sh.querySelectorAll('.dss-seg button'),function(b){ b.onclick=function(){ Array.prototype.forEach.call(b.parentNode.children,function(x){ x.classList.toggle('on',x===b); }); updGo(); }; });
    document.getElementById('dss-go').onclick=function(){ var v=function(g){ var b=el.sh.querySelector('[data-g="'+g+'"] .on'); return b?b.getAttribute('data-v'):''; };
      F.sort=v('sort'); F.price=v('price'); F.cat=v('cat'); SHOWN=40; closeSheet(); doSearch(); };
    document.getElementById('dss-clr').onclick=function(){ F={cat:'',price:'',sort:''}; SHOWN=40; closeSheet(); doSearch(); };
    function updGo(){ var keep=F, v=function(g){ var b=el.sh.querySelector('[data-g="'+g+'"] .on'); return b?b.getAttribute('data-v'):''; };
      F={sort:v('sort'),price:v('price'),cat:v('cat')}; var n=run(el.in.value).list.length; F=keep;
      document.getElementById('dss-go').textContent=n?'عرض '+n+' منتج':'لا توجد نتائج — غيّر الفلترة'; }
    updGo();
    el.sh.classList.add('on');
  }
  function closeSheet(){ if(el.sh) el.sh.classList.remove('on'); }
  function updateResultQty(id){
    var ctrl=document.getElementById('dss-ctrl-'+id); if(!ctrl) return;
    var p=INDEX.find(function(x){return String(x.id)===String(id);}); if(!p) return;
    ctrl.innerHTML=ctrlHTML(p,qtyOf(id));
  }

  var toastT=null;
  function toast(m){ el.toast.textContent=m; el.toast.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(function(){ el.toast.classList.remove('on'); },1900); }

  function open(q){
    if(!el.ov) build();
    opened=true; el.ov.classList.add('on');
    if(!INDEX.length) loadIndex();
    try{ history.pushState({dss:1},''); pushed=true; }catch(e){}
    if(typeof q==='string'&&q){ el.in.value=q; el.clear.style.display='block'; }
    setTimeout(function(){ el.in.focus(); },60);
    doSearch();
  }
  function close(fromPop){
    logNow();
    closeSheet();
    opened=false; if(el.ov) el.ov.classList.remove('on');
    if(!fromPop&&pushed){ try{ history.back(); }catch(e){} }
    pushed=false;
    if(window.updateCart){ try{ window.updateCart(); }catch(e){} }
  }
  function isOpen(){ return opened; }

  window.DSSearch={ open:open, close:close, isOpen:isOpen, _search:search, _norm:norm, _parse:parse, _run:run, _suggest:suggest };

  // save a pending search if the page is closed
  document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='hidden') logNow(); });

  // preload the index quietly once the page is idle (non-blocking, cache-first)
  function boot(){ setTimeout(loadIndex, 1200); }
  if(document.readyState==='complete'||document.readyState==='interactive') boot();
  else window.addEventListener('DOMContentLoaded',boot);
})();
