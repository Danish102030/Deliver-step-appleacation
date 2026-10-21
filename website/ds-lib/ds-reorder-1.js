/* خطوة التوصيل — "🔁 اطلب مرة ثانية" (order again).
   Puts a past order back in the cart with TODAY's menu: today's prices, only items that still exist and are
   available, the same dish options (when they still exist), and only shops that are open now.
   Then shows what was added / changed / skipped. Loaded only when the button is tapped: window.dsReorder(orderId). */
(function(){
  'use strict';
  if(window.dsReorder) return;
  var SB='https://vjuhxpttssmyomqqomdx.supabase.co', KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MjQxNjAsImV4cCI6MjA5NDUwMDE2MH0.JiGnmOEPPM3dka-KHIm5mEFs7GWb4Amsnp6R57r7Lro';
  var SM='السوبرماركت', H={apikey:KEY, Authorization:'Bearer '+KEY};
  function get(path){ return fetch(SB+'/rest/v1/'+path,{headers:H}).then(function(r){ if(!r.ok) throw new Error('http '+r.status); return r.json(); }); }
  function rpc(fn,body){ return fetch(SB+'/rest/v1/rpc/'+fn,{method:'POST',headers:Object.assign({'Content-Type':'application/json'},H),body:JSON.stringify(body)}).then(function(r){ if(!r.ok) throw new Error('http '+r.status); return r.json(); }); }
  function inList(a){ return 'in.('+a.map(function(x){ return '"'+String(x).replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"'; }).join(',')+')'; }
  function esc(t){ return String(t==null?'':t).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function fmt(n){ n=Math.round(Number(n||0)*100)/100; return String(n); }
  function phone(){ try{ return String((JSON.parse(localStorage.getItem('ds_customer')||'{}')||{}).phone||'').trim(); }catch(e){ return ''; } }
  function cartGet(){ try{ var c=JSON.parse(localStorage.getItem('qibah_cart')||'[]'); return Array.isArray(c)?c:[]; }catch(e){ return []; } }
  function vendorOf(i){ return i.vendor||i.restaurant||SM; }
  function isSM(n){ return n===SM||n==='سوبرماركت'; }
  function status(v){
    if(!v||v.is_active===false) return {open:false,txt:'غير متاح حالياً'};
    if(v.is_open===false) return {open:false,txt:'مغلق مؤقتاً'};
    if(v.is_24h) return {open:true};
    var P=function(t){ var m=/(\d{1,2}):(\d{2})/.exec(t||''); return m?(+m[1]*60+ +m[2]):null; };
    var o=P(v.open_time), c=P(v.close_time); if(o==null||c==null) return {open:true};
    var d=new Date(), nm=d.getHours()*60+d.getMinutes(), within=c>o?(nm>=o&&nm<c):(nm>=o||nm<c);
    if(within) return {open:true};
    var hh=Math.floor(o/60), mm=o%60; return {open:false,txt:'مغلق · يفتح '+((hh%12)||12)+(mm?':'+String(mm).padStart(2,'0'):'')+(hh<12?' ص':' م')};
  }
  // "اسم الصنف\n   اختيارات الوجبة:\n   - الحجم: وسط" → {base:'اسم الصنف', mods:['الحجم: وسط']}
  function parseName(n){
    var lines=String(n||'').split('\n'), base=lines[0].trim(), mods=[];
    lines.slice(1).forEach(function(l){ var m=/^\s*-\s*(.+)$/.exec(l); if(m) mods.push(m[1].trim()); });
    return {base:base, mods:mods};
  }

  /* ── the sheet ── */
  var CSS='.dsr-bg{position:fixed;inset:0;background:rgba(20,6,14,.45);z-index:2147483000;opacity:0;transition:opacity .2s}.dsr-bg.on{opacity:1}'+
    '.dsr{position:fixed;bottom:0;left:50%;transform:translate(-50%,105%);width:100%;max-width:480px;background:#fff;border-radius:26px 26px 0 0;padding:12px 16px calc(22px + env(safe-area-inset-bottom,0px));z-index:2147483001;transition:transform .3s cubic-bezier(.3,.8,.3,1);font-family:Tajawal,system-ui,sans-serif;direction:rtl;color:#1f1f1f;max-height:85vh;overflow:auto}'+
    '.dsr.on{transform:translate(-50%,0)}.dsr-g{width:40px;height:5px;border-radius:3px;background:#e5e7eb;margin:0 auto 12px}'+
    '.dsr h3{font-size:17px;font-weight:900;margin:0}.dsr p{font-size:12.5px;color:#6b7280;margin:3px 0 0}'+
    '.dsr-l{margin-top:12px;border-top:1px solid #f1e6ea}.dsr-v{font-size:12px;font-weight:900;color:#be185d;margin:10px 0 2px}'+
    '.dsr-r{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid #f1e6ea;font-size:13.5px;font-weight:700}'+
    '.dsr-r small{display:block;font-size:11px;color:#b45309;font-weight:700}.dsr-r .p{white-space:nowrap;flex-shrink:0}'+
    '.dsr-r.x>span:first-child{color:#9ca3af;text-decoration:line-through}.dsr-r.x small{color:#b91c1c;text-decoration:none;display:block}.dsr-r.x .p{color:#9ca3af;text-decoration:line-through}'+
    '.dsr-b{display:flex;gap:8px;margin-top:14px}.dsr-b button{flex:1;min-height:48px;border-radius:14px;border:none;font-family:inherit;font-weight:900;font-size:14.5px;cursor:pointer}'+
    '.dsr-b .p{background:#be185d;color:#fff}.dsr-b .s{background:#f8fafc;color:#1f1f1f;border:1px solid #f1e6ea}'+
    '.dsr-load{text-align:center;padding:26px 0;color:#6b7280;font-weight:700}.dsr-spin{width:30px;height:30px;border:3px solid #fbcfe8;border-top-color:#be185d;border-radius:50%;margin:0 auto 10px;animation:dsrS .8s linear infinite}@keyframes dsrS{to{transform:rotate(360deg)}}';
  var bg, sh;
  function open(html){
    if(!bg){ var st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
      bg=document.createElement('div'); bg.className='dsr-bg'; bg.onclick=close; sh=document.createElement('div'); sh.className='dsr'; sh.setAttribute('role','dialog');
      document.body.appendChild(bg); document.body.appendChild(sh); }
    sh.innerHTML='<div class="dsr-g"></div>'+html; bg.style.display='block';
    requestAnimationFrame(function(){ bg.classList.add('on'); sh.classList.add('on'); });
  }
  function close(){ if(!sh) return; bg.classList.remove('on'); sh.classList.remove('on'); setTimeout(function(){ if(bg) bg.style.display='none'; },250); }
  window.dsReorderClose=close;

  /* ── rebuild one shop's items with today's menu ── */
  async function buildVendor(vName, items, dig){
    var out={name:vName, add:[], notes:[], link:'/', ok:true};
    if(isSM(vName)){
      out.link='/supermarket';
      var names=items.map(function(i){ return parseName(i.product_name).base; });
      var prods=await get('supermarket_products?select=id,name,price,image_url,in_stock,is_active&name='+encodeURIComponent(inList(names)));
      items.forEach(function(i){ var b=parseName(i.product_name).base, q=Math.max(1,Number(i.quantity)||1);
        var p=prods.find(function(x){ return x.name===b&&x.is_active!==false; });
        if(!p){ out.notes.push({name:b,qty:q,old:i.unit_price,why:'لم يعد موجوداً'}); return; }
        if(p.in_stock===false){ out.notes.push({name:b,qty:q,old:i.unit_price,why:'نفذت الكمية اليوم'}); return; }
        out.add.push({line:{id:p.id,name:p.name,price:Number(p.price),qty:q,image:p.image_url||'',vendor:SM,vendor_wa:'',vendor_fee:null},old:Number(i.unit_price)}); });
      return out;
    }
    var rs=await get('restaurants?select=*&name=eq.'+encodeURIComponent(vName)+'&limit=1'), r=rs&&rs[0];
    if(!r){ out.ok=false; out.why='المتجر غير متاح في التطبيق'; return out; }
    out.link=r.category==='ds_store'?'/shop':'/menu?id='+encodeURIComponent(r.id);
    var st=status(r); if(!st.open){ out.ok=false; out.why=st.txt; return out; }
    var menu=await get('menu_items?select=id,name,price,discount_price,image_url,in_stock,is_active&restaurant_id=eq.'+encodeURIComponent(r.id)+'&is_active=eq.true&limit=2000');
    var groups=[], opts=[];
    if(menu.length){
      groups=await get('modifier_groups?select=id,menu_item_id,name&menu_item_id='+encodeURIComponent(inList(menu.map(function(m){ return m.id; }))));
      if(groups.length) opts=await get('modifier_options?select=id,group_id,name,extra_price&group_id='+encodeURIComponent(inList(groups.map(function(g){ return g.id; }))));
    }
    function price(m){ var d=Number(m.discount_price); return (d>0&&d<Number(m.price))?d:Number(m.price); }
    var isStore=r.category==='ds_store', fee=(dig&&dig.on)?Number(dig.fee)||0:null;
    items.forEach(function(i){
      var pn=parseName(i.product_name), q=Math.max(1,Number(i.quantity)||1), base=pn.base, extra=0, labels=[], photo=false, model=null;
      if(isStore){                                               // store: "… (صورة واتساب)" / "… (iPhone 16)"
        var mm=/^(.*) \(([^()]+)\)$/.exec(base);
        if(mm&&!menu.some(function(x){ return x.name===base; })){ base=mm[1]; if(mm[2]==='صورة واتساب') photo=true; else model=mm[2]; }
      }
      var m=menu.find(function(x){ return x.name===base; });
      if(!m){ out.notes.push({name:pn.base,qty:q,old:i.unit_price,why:'لم يعد في القائمة'}); return; }
      if(m.in_stock===false){ out.notes.push({name:pn.base,qty:q,old:i.unit_price,why:'نفذت الكمية اليوم'}); return; }
      var gs=groups.filter(function(g){ return g.menu_item_id===m.id; });
      if(isStore&&model){
        var o=opts.find(function(x){ return gs.some(function(g){ return g.id===x.group_id; })&&x.name===model; });
        if(!o){ out.notes.push({name:pn.base,qty:q,old:i.unit_price,why:'الموديل لم يعد متوفراً — اختره من المتجر'}); return; }
        out.add.push({line:{id:m.id+'|'+o.id,name:m.name+' ('+o.name+')',price:price(m)+(Number(o.extra_price)||0),qty:q,image:m.image_url||'',modifiers:[],restaurant:r.name,restaurant_wa:r.whatsapp||'',vendor:r.name,vendor_wa:r.whatsapp||'',vendor_fee:Number(r.delivery_fee)||0},old:Number(i.unit_price)}); return;
      }
      if(isStore&&photo){
        if(fee==null){ out.notes.push({name:pn.base,qty:q,old:i.unit_price,why:'خدمة الصورة غير متاحة حالياً'}); return; }
        out.add.push({line:{id:m.id+'|photo',name:m.name+' (صورة واتساب)',price:price(m)+fee,qty:q,image:m.image_url||'',modifiers:[],restaurant:r.name,restaurant_wa:r.whatsapp||'',vendor:r.name,vendor_wa:r.whatsapp||'',vendor_fee:Number(r.delivery_fee)||0,ds_digital:true},old:Number(i.unit_price)}); return;
      }
      if(pn.mods.length){                                        // dish options "الحجم: وسط"
        for(var k=0;k<pn.mods.length;k++){ var lab=pn.mods[k], ix=lab.indexOf(': '), gn=ix>0?lab.slice(0,ix):'', on=ix>0?lab.slice(ix+2):lab;
          var g=gs.find(function(x){ return x.name===gn; }), op=g&&opts.find(function(x){ return x.group_id===g.id&&x.name===on; });
          if(!op){ out.notes.push({name:pn.base,qty:q,old:i.unit_price,why:'الخيارات تغيّرت — اختره من القائمة'}); return; }
          extra+=Number(op.extra_price)||0; labels.push(g.name+': '+op.name); }
      }
      out.add.push({line:{id:m.id,name:m.name,price:price(m)+extra,qty:q,image:m.image_url||'',modifiers:labels,restaurant:r.name,restaurant_wa:r.whatsapp||'',vendor:r.name,vendor_wa:r.whatsapp||'',vendor_fee:Number(r.delivery_fee)||0},old:Number(i.unit_price),vendorRow:r});
    });
    out.vendorRow=r;
    return out;
  }

  /* ── put the lines in the cart (same format as the shop pages → cart + checkout work unchanged) ── */
  function sameLine(a,b){ return a.id===b.id&&vendorOf(a)===vendorOf(b)&&JSON.stringify(a.modifiers||[])===JSON.stringify(b.modifiers||[]); }
  function saveCart(c, vendors){
    try{ localStorage.setItem('qibah_cart',JSON.stringify(c)); }catch(e){}
    var vs=[]; c.forEach(function(i){ var v=vendorOf(i); if(vs.indexOf(v)<0) vs.push(v); });
    try{
      if(vs.length===1&&!isSM(vs[0])){
        var r=null; vendors.forEach(function(x){ if(x.vendorRow&&x.vendorRow.name===vs[0]) r=x.vendorRow; });
        if(r){ var photoOnly=c.every(function(i){ return i.ds_digital; });
          localStorage.setItem('qibah_restaurant',JSON.stringify({id:r.id,name:r.name,name_ar:r.name_ar||'',whatsapp:r.whatsapp||'',delivery_fee:Number(r.delivery_fee)||0}));
          localStorage.setItem('qibah_delivery_fee',String(photoOnly?0:(Number(r.delivery_fee)||0)));
          var dm=Number(r.delivery_discount_min)||0, df=Number(r.delivery_discount_fee)||0;
          if(!photoOnly&&dm>0&&df<(Number(r.delivery_fee)||0)) localStorage.setItem('qibah_delivery_disc',JSON.stringify({min:dm,fee:df})); else localStorage.removeItem('qibah_delivery_disc'); }
      }else{ localStorage.removeItem('qibah_restaurant'); localStorage.removeItem('qibah_delivery_fee'); localStorage.removeItem('qibah_delivery_disc'); }
    }catch(e){}
    try{ localStorage.setItem('ds_reorder_last',JSON.stringify({t:Date.now()})); }catch(e){}
  }
  function apply(vendors, replace){
    var c=replace?[]:cartGet();
    vendors.forEach(function(v){ v.add.forEach(function(a){ var ex=c.find(function(x){ return sameLine(x,a.line); }); if(ex) ex.qty=Number(ex.qty||0)+a.line.qty; else c.push(a.line); }); });
    saveCart(c, vendors);
  }
  function result(vendors){
    var added=0, total=0, h='', single=vendors.filter(function(v){ return v.add.length; });
    vendors.forEach(function(v){
      if(vendors.length>1||!v.ok) h+='<div class="dsr-v">'+(isSM(v.name)?'🛒 ':'🍽️ ')+esc(v.name)+'</div>';
      if(!v.ok){ h+='<div class="dsr-r x"><span>'+esc(v.name)+'<small>'+esc(v.why)+'</small></span><span class="p"></span></div>'; return; }
      v.add.forEach(function(a){ added+=a.line.qty; total+=a.line.price*a.line.qty;
        var ch=(a.old>0&&Math.abs(a.old-a.line.price)>=0.01)?'<small>السعر تغيّر: '+fmt(a.old)+' ← '+fmt(a.line.price)+' ر.س</small>':'';
        var mods=(a.line.modifiers&&a.line.modifiers.length)?'<small style="color:#6b7280">'+esc(a.line.modifiers.join(' · '))+'</small>':'';
        h+='<div class="dsr-r"><span>'+a.line.qty+'× '+esc(a.line.name)+mods+ch+'</span><span class="p">'+fmt(a.line.price*a.line.qty)+' ر.س</span></div>'; });
      v.notes.forEach(function(n){ h+='<div class="dsr-r x"><span>'+n.qty+'× '+esc(n.name)+'<small>'+esc(n.why)+' — ما أضفناه</small></span><span class="p">'+fmt((Number(n.old)||0)*n.qty)+' ر.س</span></div>'; });
    });
    if(!added){
      open('<h3>😕 ما قدرنا نعيد هذا الطلب</h3><p>المنتجات أو المتجر غير متاحة الآن</p><div class="dsr-l">'+h+'</div><div class="dsr-b"><button class="s" onclick="dsReorderClose()">إغلاق</button>'+
        (single.length||vendors[0]?'<button class="p" onclick="location.href=\''+esc((vendors[0]||{}).link||'/')+'\'">تصفح القائمة</button>':'')+'</div>');
      return;
    }
    var link=(single[0]||{}).link||'/';
    open('<h3>✅ أضفنا طلبك السابق للسلة</h3><p>'+(vendors.length===1?esc(vendors[0].name)+' · ':'')+'بأسعار اليوم</p><div class="dsr-l">'+h+'</div>'+
      '<div class="dsr-b"><button class="s" onclick="location.href=\''+esc(link)+'\'">أضيف شي ثاني</button><button class="p" onclick="location.href=\'/cart\'">إتمام الطلب · '+fmt(total)+' ر.س</button></div>');
  }

  window.dsReorder=async function(orderId){
    open('<div class="dsr-load"><div class="dsr-spin"></div>نجهّز طلبك…</div>');
    try{
      var ph=phone(); if(!ph) throw new Error('no phone');
      var list=await rpc('my_orders',{p_phone:ph}), o=(list||[]).find(function(x){ return x.id===orderId; });
      if(!o||!Array.isArray(o.items)||!o.items.length) throw new Error('no order');
      var by={}, order=[];
      o.items.forEach(function(i){ var v=i.vendor_name||o.vendor_name||SM; if(!by[v]){ by[v]=[]; order.push(v); } by[v].push(i); });
      var dig=null; if(order.length){ try{ var s=await get('settings?select=value&key=eq.ds_store_digital&limit=1'); var v=s&&s[0]&&s[0].value; dig=typeof v==='string'?JSON.parse(v):v; }catch(e){} }
      var vendors=[]; for(var k=0;k<order.length;k++){ vendors.push(await buildVendor(order[k], by[order[k]], dig)); }
      var newV=vendors.filter(function(v){ return v.add.length; }).map(function(v){ return v.add[0].line.vendor; });
      var cur=cartGet(), have=[]; cur.forEach(function(i){ var v=vendorOf(i); if(have.indexOf(v)<0) have.push(v); });
      var all=have.slice(); newV.forEach(function(v){ if(all.indexOf(v)<0) all.push(v); });
      if(newV.length&&all.length>2){                           // the app allows 2 shops per cart
        window._dsrPending=vendors;
        open('<h3>🛒 سلتك فيها طلبات من متجر آخر</h3><p>السلة تقبل متجرين فقط. نفرّغ السلة ونضع طلبك السابق؟</p><div class="dsr-l"><div class="dsr-r"><span>في سلتك الآن: '+esc(have.join(' · '))+'</span></div></div>'+
          '<div class="dsr-b"><button class="s" onclick="dsReorderClose()">إلغاء</button><button class="p" onclick="window._dsrGo(true)">نعم، استبدل السلة</button></div>');
        return;
      }
      if(newV.length) apply(vendors,false);
      result(vendors);
    }catch(e){
      open('<h3>تعذر تجهيز الطلب</h3><p>تأكد من الإنترنت وحاول مرة ثانية</p><div class="dsr-b"><button class="s" onclick="dsReorderClose()">إغلاق</button></div>');
    }
  };
  window._dsrGo=function(replace){ var v=window._dsrPending||[]; apply(v,replace); result(v); };
})();
