/* خطوة التوصيل — the cart always uses TODAY's prices (owner approved 18 Nov 2026, after a coffee price review).
   dsPriceCheck(sb): looks up every cart line in the database (restaurant / coffee / buffet dishes in menu_items,
   supermarket products in supermarket_products), then
     • a changed price → the line gets today's price (dishes with options: only the dish's own part changes,
       when the line remembers it as `base`)
     • a product switched off / sold out → the line is taken out of the cart
   and saves the cart. Lines it can't recognise (parcel, pharmacy, متجر خطوة cards, old ids) are left as they are.
   Returns {changed:[{id,name,old,now}], gone:[name]} — or null when nothing could be checked (no internet).
   dsPriceNote(r) → the yellow note «🔄 حدّثنا سلتك بأسعار اليوم» (HTML), '' when nothing changed. */
(function(){
  'use strict';
  var UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, SM='السوبرماركت';
  function vendorOf(i){ return i.vendor||i.restaurant||SM; }
  function esc(t){ return String(t==null?'':t).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function money(n){ n=Math.round(Number(n)*100)/100; return (n%1?n.toFixed(2):String(n)); }
  window.dsPriceCheck=async function(sb){
    var cart; try{ cart=JSON.parse(localStorage.getItem('qibah_cart')||'[]'); }catch(e){ return null; }
    if(!sb||!Array.isArray(cart)||!cart.length) return {changed:[],gone:[]};
    var ok=function(i){ return i&&!i.ds_digital&&UUID.test(String(i.id))&&Number(i.price)>0; };
    var smIds=[], mIds=[];
    cart.forEach(function(i){ if(!ok(i)) return; (vendorOf(i)===SM?smIds:mIds).push(String(i.id)); });
    if(!smIds.length&&!mIds.length) return {changed:[],gone:[]};
    var rows={};
    try{
      var res=await Promise.all([
        smIds.length?sb.from('supermarket_products').select('id,price,is_active,in_stock').in('id',smIds):Promise.resolve({data:[]}),
        mIds.length?sb.from('menu_items').select('id,price,discount_price,is_active,in_stock').in('id',mIds):Promise.resolve({data:[]})
      ]);
      if(res[0].error||res[1].error) return null;
      (res[0].data||[]).forEach(function(r){ rows['s'+r.id]=r; });
      (res[1].data||[]).forEach(function(r){ rows['m'+r.id]=r; });
    }catch(e){ return null; }
    // the cart may have changed while we were asking (customer tapped + / −) → work on the newest copy
    try{ cart=JSON.parse(localStorage.getItem('qibah_cart')||'[]'); }catch(e){ return null; }
    var out={changed:[],gone:[]}, keep=[];
    cart.forEach(function(i){
      if(!ok(i)){ keep.push(i); return; }
      var sm=vendorOf(i)===SM, r=rows[(sm?'s':'m')+String(i.id)];
      if(!r){ keep.push(i); return; }                                   // not found → leave it (never guess)
      if(r.is_active===false||r.in_stock===false){ out.gone.push(i.name); return; }
      var base=Number(sm?r.price:(Number(r.discount_price)||r.price));
      if(!(base>0)){ keep.push(i); return; }
      var hasMods=Array.isArray(i.modifiers)&&i.modifiers.length, old=Number(i.price), now=old;
      if(!hasMods) now=base;
      else if(i.base!=null&&Number(i.base)>0) now=Math.round((old-Number(i.base)+base)*100)/100;
      if(Math.abs(now-old)>0.001){ out.changed.push({id:String(i.id),name:i.name,old:old,now:now}); i.price=now; }
      if(hasMods&&i.base!=null) i.base=base;
      keep.push(i);
    });
    if(out.changed.length||out.gone.length){ try{ localStorage.setItem('qibah_cart',JSON.stringify(keep)); }catch(e){} }
    return out;
  };
  window.dsPriceNote=function(r){
    if(!r||(!r.changed.length&&!r.gone.length)) return '';
    var li=r.changed.map(function(c){ return '<div>• '+esc(c.name)+': <span style="text-decoration:line-through;opacity:.7">'+money(c.old)+'</span> ← <b>'+money(c.now)+' ريال</b></div>'; })
      .concat(r.gone.map(function(n){ return '<div>• '+esc(n)+': <b>غير متوفر الآن</b> — أزلناه من السلة</div>'; }));
    return '<div class="ds-price-note" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:10px 12px;margin-bottom:10px;font-size:12.5px;line-height:1.75;color:#78350f">'+
      '<b>🔄 حدّثنا سلتك بأسعار اليوم</b>'+li.join('')+'</div>';
  };
})();
