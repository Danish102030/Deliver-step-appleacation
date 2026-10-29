/* Delivery Step Admin → Categories, Products (search, filters, bulk change, quick add, barcode camera) and Store staff.
   Loaded by admin.html the first time one of these pages is opened (see _lazy in admin.html).
   Keep the file name versioned (admin-supermarket-1.js, -2.js …): files in ds-lib are cached for a year. */
(function(){
  var S={"cats": "        <div class=\"section-header\">\n          <div class=\"section-title\">Supermarket Categories</div>\n          <button class=\"btn-add\" onclick=\"openAddCat()\"><i class=\"ti ti-plus\" style=\"font-size:14px\"></i> Add category</button>\n        </div>\n        <div id=\"cats-grid\"><div class=\"loading\">Loading...</div></div>", "products": "        <div class=\"section-header\">\n          <div class=\"section-title\">Supermarket Products <span class=\"pr-count\" id=\"pr-total\"></span></div>\n          <div class=\"section-actions\">\n            <select id=\"products-cat-filter\" class=\"tb-btn\" style=\"cursor:pointer;max-width:200px\" onchange=\"prSetCat(this.value)\">\n              <option value=\"\">All categories</option>\n            </select>\n            <button class=\"btn-add\" onclick=\"prQuickAdd()\"><i class=\"ti ti-plus\" style=\"font-size:14px\"></i> Add product</button>\n          </div>\n        </div>\n        <div class=\"pr-search\"><i class=\"ti ti-search\"></i>\n          <input id=\"pr-q\" type=\"search\" autocomplete=\"off\" spellcheck=\"false\" dir=\"auto\" placeholder=\"ابحث أو اكتب: شوكولاتة أقل من 5 بدون صورة\" oninput=\"prSearch(this.value)\"/>\n          <button type=\"button\" class=\"pr-scan\" onclick=\"prScan('search')\" title=\"Scan a barcode\" aria-label=\"Scan a barcode\"><i class=\"ti ti-barcode\"></i></button>\n        </div>\n        <div class=\"pr-tools\"><button type=\"button\" class=\"pr-fbtn\" id=\"pr-fbtn\" onclick=\"prFilters()\"><i class=\"ti ti-adjustments-horizontal\"></i> Filters</button><div class=\"pr-und\" id=\"pr-und\"></div></div>\n        <div class=\"pr-chips\" id=\"pr-chips\"></div>\n        <div class=\"pr-bulk\" id=\"pr-bulk\"></div>\n        <div id=\"products-table\"><div class=\"loading\">Loading...</div></div>\n        <div id=\"pr-more\"></div>\n        <button type=\"button\" class=\"pr-fab\" onclick=\"prQuickAdd()\"><i class=\"ti ti-plus\"></i> Add product</button>", "storestaff": "        <div class=\"mk-title\">🧑‍💼 Supermarket staff</div>\n        <div class=\"mk-sub\">Logins for the supermarket team. They can change <b>products, prices, photos, stock and categories</b>, add new products, and see the <b>items</b> of supermarket orders. They can <b>not</b> see customer phone numbers, addresses, money, other shops or settings, and they can not delete anything (only hide). Every change they make is written in the log below.</div>\n        <div class=\"ss-link\">📱 Staff open: <code dir=\"ltr\">deliverystep.app/store</code> <button type=\"button\" class=\"tb-btn\" onclick=\"ssCopyLink()\"><i class=\"ti ti-copy\"></i> Copy link</button> <a class=\"tb-btn\" href=\"/store\" target=\"_blank\" rel=\"noopener\" style=\"text-decoration:none\"><i class=\"ti ti-external-link\"></i> Open</a></div>\n        <div class=\"sr-card\" style=\"max-width:1100px;margin-bottom:12px\">\n          <div class=\"sr-h\">➕ New staff login</div>\n          <div class=\"sr-hs\">Give the email + password to the staff member. The email does not need to be real, e.g. <span dir=\"ltr\">ahmed@qibah-market.com</span>.</div>\n          <div class=\"ss-form\">\n            <div><label>Name</label><input id=\"ss-name\" maxlength=\"60\" placeholder=\"Ahmed\"></div>\n            <div><label>Email (login)</label><input id=\"ss-email\" type=\"email\" dir=\"ltr\" autocomplete=\"off\" placeholder=\"name@example.com\"></div>\n            <div><label>Password (8+)</label><div class=\"ss-pw\"><input id=\"ss-pass\" dir=\"ltr\" autocomplete=\"new-password\" placeholder=\"••••••••\"><button type=\"button\" class=\"tb-btn\" title=\"Make a password\" onclick=\"ssGenPw('ss-pass')\"><i class=\"ti ti-dice-5\"></i></button></div></div>\n            <button type=\"button\" class=\"sr-b add\" id=\"ss-add\" style=\"padding:9px 14px\" onclick=\"ssCreate()\">Create login</button>\n          </div>\n          <div class=\"ss-msg\" id=\"ss-msg\"></div>\n        </div>\n        <div class=\"sr-card\" style=\"max-width:1100px;margin-bottom:12px\">\n          <div class=\"sr-h\">👥 Staff accounts</div>\n          <div class=\"sr-hs\">Switch off = the person can not log in or change anything any more (their old changes stay in the log).</div>\n          <div id=\"ss-list\"><div class=\"sr-empty\">Loading…</div></div>\n        </div>\n        <div class=\"sr-card\" style=\"max-width:1100px\">\n          <div class=\"sr-top\" style=\"margin-bottom:6px\"><div style=\"flex:1\"><div class=\"sr-h\">📝 Changes log</div><div class=\"sr-hs\" style=\"margin-bottom:0\">Last 300 changes by the staff. <span class=\"ss-big\">big</span> = price changed by more than 50%.</div></div>\n            <div class=\"sr-seg\" id=\"ss-seg\">\n              <button type=\"button\" data-f=\"all\" class=\"on\" onclick=\"ssFilter('all')\">All</button>\n              <button type=\"button\" data-f=\"price\" onclick=\"ssFilter('price')\">Prices</button>\n              <button type=\"button\" data-f=\"new\" onclick=\"ssFilter('new')\">New</button>\n              <button type=\"button\" data-f=\"hidden\" onclick=\"ssFilter('hidden')\">Hidden</button>\n            </div>\n            <button type=\"button\" class=\"tb-btn\" onclick=\"loadStoreStaff()\"><i class=\"ti ti-refresh\"></i> Refresh</button></div>\n          <div id=\"ss-log\"><div class=\"sr-empty\">Loading…</div></div>\n        </div>"};
  Object.keys(S).forEach(function(k){ var el=document.getElementById('section-'+k); if(el) el.innerHTML=S[k]; });
})();

// ── Supermarket staff (logins are made by the server function store-staff; only an admin can call it) ──
var SS={rows:[],log:[],f:'all'};
async function ssCall(body){
  var ses=(await sb.auth.getSession()).data.session; if(!ses) throw new Error('Please log in again');
  var r=await fetch(SB_URL+'/functions/v1/store-staff',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+ses.access_token,apikey:SB_KEY},body:JSON.stringify(body)});
  var j={}; try{ j=await r.json(); }catch(e){}
  if(!r.ok||!j.ok) throw new Error(j.error||('Error '+r.status));
  return j;
}
function ssGenPw(id){
  var a='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789', out='', b=new Uint32Array(10); crypto.getRandomValues(b);
  for(var i=0;i<10;i++) out+=a[b[i]%a.length];
  var el=document.getElementById(id); if(el){ el.value=out; el.focus(); el.select&&el.select(); }
  return out;
}
function ssMsg(t,ok){ var m=document.getElementById('ss-msg'); if(m){ m.textContent=t||''; m.style.color=ok?'#15803d':'#b91c1c'; } }
function ssErr(e){ var t=String(e&&e.message||e); if(/already.*(registered|exists)/i.test(t)) return 'This email already has a login — use another email.'; if(/bad email/i.test(t)) return 'Email is not valid.'; if(/too short/i.test(t)) return 'Password must be 8 letters/numbers or more.'; if(/not allowed/i.test(t)) return 'Only the admin can do this.'; return t; }
async function ssCreate(){
  var name=document.getElementById('ss-name').value.trim(), email=document.getElementById('ss-email').value.trim().toLowerCase(), pw=document.getElementById('ss-pass').value;
  if(!name) return ssMsg('Write the staff name.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ssMsg('Email is not valid.');
  if(pw.length<8) return ssMsg('Password must be 8 letters/numbers or more.');
  var b=document.getElementById('ss-add'); b.disabled=true; ssMsg('Creating…',true);
  try{
    await ssCall({action:'create',name:name,email:email,password:pw});
    ssMsg('✅ Login created for '+name+'. Send them: deliverystep.app/store + the email + the password.',true);
    document.getElementById('ss-name').value=''; document.getElementById('ss-email').value=''; document.getElementById('ss-pass').value='';
    loadStoreStaff();
  }catch(e){ ssMsg('❌ '+ssErr(e)); }
  b.disabled=false;
}
async function ssToggle(uid,on){
  var r=await sb.from('store_staff').update({active:on}).eq('user_id',uid);
  if(r.error){ showToast('❌ '+r.error.message); }
  else showToast(on?'✅ Login switched on':'⛔ Login switched off');
  loadStoreStaff();
}
async function ssPassword(uid){
  var row=SS.rows.find(function(x){ return x.user_id===uid; }); if(!row) return;
  var pw=prompt('New password for '+(row.name||row.email)+' (8 letters/numbers or more).\nLeave the suggested one or type your own:', ssGenPw('ss-none'));
  if(pw==null) return;
  if(pw.length<8){ showToast('❌ Password must be 8 letters/numbers or more'); return; }
  try{ await ssCall({action:'password',user_id:uid,password:pw}); showToast('✅ Password changed — give the new one to '+(row.name||'the staff member')); }
  catch(e){ showToast('❌ '+ssErr(e)); }
}
function ssCopyLink(){ var u='https://deliverystep.app/store'; try{ navigator.clipboard.writeText(u).then(function(){ showToast('✅ Link copied'); },function(){ prompt('Copy the link:',u); }); }catch(e){ prompt('Copy the link:',u); } }
function ssFilter(f){ SS.f=f; document.querySelectorAll('#ss-seg button').forEach(function(b){ b.classList.toggle('on',b.dataset.f===f); }); ssRenderLog(); }
function ssWhen(t){ var d=new Date(t); return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+' '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); }
var SS_FIELD={name:'الاسم',name_en:'الاسم بالإنجليزي',price:'السعر',category_id:'القسم',barcode:'الباركود',unit:'الوحدة',sort_order:'الترتيب',description:'الوصف',parent_id:'القسم الرئيسي'};
function ssLogText(x){
  var v=function(s){ return escHtml(s==null||s===''?'—':s); };
  if(x.field==='new') return x.entity==='category'?'➕ قسم جديد':'➕ أضاف المنتج ('+v(x.new_value)+' ر.س)';
  if(x.field==='price'){ var a=parseFloat(x.old_value), b=parseFloat(x.new_value), big=a>0&&b>=0&&Math.abs(b-a)/a>0.5;
    return '💰 السعر <bdi>'+v(x.old_value)+'</bdi> ← <b><bdi>'+v(x.new_value)+'</bdi></b>'+(big?'<span class="ss-big">big</span>':''); }
  if(x.field==='in_stock') return x.new_value==='true'?'✅ صار متوفر':'⛔ نفذت الكمية';
  if(x.field==='hidden') return x.new_value==='true'?'🙈 أخفاه من التطبيق':'👁 أظهره في التطبيق';
  if(x.field==='photo') return '📷 غيّر الصورة';
  if(x.field==='status') return x.new_value==='ready'?'✅ الطلب جاهز':x.new_value==='preparing'?'🧺 بدأ التجهيز':'↩️ تراجع';
  return escHtml(SS_FIELD[x.field]||x.field)+': <bdi>'+v(x.old_value)+'</bdi> ← <b><bdi>'+v(x.new_value)+'</bdi></b>';
}
function ssRenderLog(){
  var el=document.getElementById('ss-log'); if(!el) return;
  var rows=SS.log.filter(function(x){ return SS.f==='all'||x.field===SS.f; });
  el.innerHTML=rows.length?rows.map(function(x){
    return '<div class="ss-log"><div class="t">'+ssWhen(x.at)+'</div><div class="w"><b>'+escHtml(x.entity_name||'')+'</b> — '+ssLogText(x)+'</div><div class="by">'+(x.staff_name?'<bdi>'+escHtml(x.staff_name)+'</bdi>':'')+'</div></div>';
  }).join(''):'<div class="sr-empty">'+(SS.log.length?'Nothing of this type.':'No changes yet.')+'</div>';
}
async function loadStoreStaff(){
  var list=document.getElementById('ss-list');
  var a=await sb.from('store_staff').select('user_id,name,email,active,created_at').order('created_at',{ascending:true});
  if(a.error){ list.innerHTML='<div class="sr-empty">Could not load: '+escHtml(a.error.message)+'</div>'; }
  else{
    SS.rows=a.data||[];
    list.innerHTML=SS.rows.length?SS.rows.map(function(x){
      var on=x.active!==false;
      return '<div class="ss-acc"><div class="ss-av">'+escHtml((x.name||x.email||'?').trim().charAt(0).toUpperCase())+'</div>'+
        '<div class="ss-who"><b><bdi>'+escHtml(x.name||'—')+'</bdi></b><div dir="ltr">'+escHtml(x.email||'')+'</div></div>'+
        '<span class="ss-on '+(on?'y':'n')+'">'+(on?'Active':'Switched off')+'</span>'+
        '<button type="button" class="sr-b" data-u="'+escHtml(x.user_id)+'" onclick="ssPassword(this.dataset.u)"><i class="ti ti-key"></i> New password</button>'+
        '<button type="button" class="sr-b" data-u="'+escHtml(x.user_id)+'" data-on="'+(on?0:1)+'" onclick="ssToggle(this.dataset.u,this.dataset.on===\'1\')" style="'+(on?'color:#b91c1c':'color:#15803d')+'">'+(on?'Switch off':'Switch on')+'</button></div>';
    }).join(''):'<div class="sr-empty">No staff logins yet — make the first one above.</div>';
  }
  var l=await sb.from('store_change_log').select('at,staff_name,entity,entity_name,field,old_value,new_value').order('at',{ascending:false}).limit(300);
  if(l.error){ document.getElementById('ss-log').innerHTML='<div class="sr-empty">Could not load: '+escHtml(l.error.message)+'</div>'; return; }
  SS.log=l.data||[]; ssRenderLog();
}

// ══════════════════════════════════
// CATEGORIES
// ══════════════════════════════════
async function loadCats(){
  document.getElementById('cats-grid').innerHTML='<div class="loading">Loading...</div>';
  try{
    const{data}=await sb.from('supermarket_categories').select('*').order('sort_order');
    renderCats(data||[]);
  }catch(e){
    document.getElementById('cats-grid').innerHTML='<div class="empty-state"><i class="ti ti-alert-circle"></i>Error</div>';
  }
}

function renderCats(list){
  if(!list.length){document.getElementById('cats-grid').innerHTML='<div class="empty-state"><i class="ti ti-building-store"></i>No categories yet</div>';return;}

  // Separate main and sub categories
  const mains = list.filter(c => !c.parent_name);
  const subs   = list.filter(c =>  c.parent_name);

  let html = '<div style="display:flex;flex-direction:column;gap:14px">';

  mains.forEach(c => {
    const children = subs.filter(s => s.parent_name === c.name);
    const imgHtml  = c.image_url
      ? '<img src="'+c.image_url+'" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>'
      : '<i class="ti ti-photo" style="font-size:20px;color:var(--muted)"></i>';

    html += '<div class="card" style="padding:12px">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">' +
        '<div style="width:48px;height:48px;border-radius:8px;overflow:hidden;flex-shrink:0;background:'+(c.bg_color||'#f0fdf4')+';display:flex;align-items:center;justify-content:center">'+imgHtml+'</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:13px;font-weight:500;direction:rtl">'+c.name+'</div>' +
          '<div style="font-size:10px;color:var(--muted);margin-top:2px">' +
            '#'+c.sort_order+' · '+(c.is_active?'<span style="color:var(--green-text)">Active</span>':'<span style="color:var(--red-text)">Hidden</span>') +
            (children.length?' · <span style="color:var(--blue-text)">'+children.length+' sub-categories</span>':'') +
          '</div>' +
        '</div>' +
        '<div class="btn-row">' +
          '<button class="icon-btn icon-btn-rose" onclick="openEditCat(\''+c.id+'\')"><i class="ti ti-edit"></i></button>' +
          '<button class="icon-btn icon-btn-red" onclick="deleteCat(\''+c.id+'\',\''+c.name.replace(/'/g,"\\'")+'\')"><i class="ti ti-trash"></i></button>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;margin-bottom:'+(children.length?'12px':'0')+'">' +
        '<button class="va-btn va-btn-rose" style="flex:1;justify-content:center" onclick="goToProducts(\''+c.name.replace(/'/g,"\\'")+'\')"><i class="ti ti-package" style="font-size:12px"></i> Products</button>' +
        '<button class="va-btn" style="justify-content:center" onclick="openAddSuperProduct(\''+c.name.replace(/'/g,"\\'")+'\')"><i class="ti ti-plus" style="font-size:12px"></i> Add product</button>' +
        '<button class="va-btn" style="justify-content:center;border-color:#bfdbfe;color:#1d4ed8;background:#eff6ff" onclick="openAddSubCat(\''+c.name.replace(/'/g,"\\'")+'\')"><i class="ti ti-category-plus" style="font-size:12px"></i> Sub</button>' +
      '</div>' +

      // Sub-categories
      (children.length ? '<div style="border-top:1px solid var(--border);padding-top:10px">' +
        '<div style="font-size:11px;font-weight:500;color:var(--muted);margin-bottom:8px;display:flex;align-items:center;gap:5px"><i class="ti ti-corner-down-right" style="font-size:13px"></i> Sub-categories</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px">' +
        children.map(s => {
          const sImg = s.image_url
            ? '<img src="'+s.image_url+'" style="width:100%;height:100%;object-fit:cover;border-radius:4px"/>'
            : '<i class="ti ti-photo" style="font-size:14px;color:var(--muted)"></i>';
          return '<div style="display:flex;align-items:center;gap:10px;background:var(--bg);border:0.5px solid var(--border);border-radius:8px;padding:8px 10px">' +
            '<div style="width:34px;height:34px;border-radius:6px;overflow:hidden;flex-shrink:0;background:'+(s.bg_color||'#f0fdf4')+';display:flex;align-items:center;justify-content:center">'+sImg+'</div>' +
            '<div style="flex:1"><div style="font-size:12px;font-weight:500;direction:rtl">'+s.name+'</div><div style="font-size:10px;color:var(--muted)">'+(s.is_active?'Active':'Hidden')+'</div></div>' +
            '<div class="btn-row">' +
              '<button class="icon-btn icon-btn-rose" style="width:24px;height:24px;font-size:12px" onclick="openEditCat(\''+s.id+'\')"><i class="ti ti-edit"></i></button>' +
              '<button class="icon-btn icon-btn-red" style="width:24px;height:24px;font-size:12px" onclick="deleteCat(\''+s.id+'\',\''+s.name.replace(/'/g,"\\'")+'\')"><i class="ti ti-trash"></i></button>' +
              '<button class="icon-btn" style="width:24px;height:24px;font-size:12px;border-color:#bfdbfe;color:#1d4ed8" onclick="goToProducts(\''+s.name.replace(/'/g,"\\'")+'\')"><i class="ti ti-package"></i></button>' +
            '</div>' +
          '</div>';
        }).join('') +
        '</div></div>' : '') +
    '</div>';
  });

  html += '</div>';
  document.getElementById('cats-grid').innerHTML = html;
}

function openAddSubCat(parentName){
  openAddCat();
  document.getElementById('cat-parent').value=parentName;
  document.getElementById('modal-cat-title').textContent='Add sub-category · '+parentName;
}

function openAddCat(){
  document.getElementById('modal-cat-title').textContent='Add category';
  document.getElementById('cat-edit-id').value='';
  document.getElementById('cat-name').value='';
  document.getElementById('cat-slug').value='';
  document.getElementById('cat-color').value='#f0fdf4';
  document.getElementById('cat-color-hex').value='#f0fdf4';
  document.getElementById('cat-order').value='1';
  document.getElementById('cat-active').value='true';
  document.getElementById('cat-img-preview').style.display='none';
  document.getElementById('cat-img-ph').style.display='block';
  catImgFile=null;catImgUrl='';
  loadParentCatOptions('');
  showModal('modal-cat');
}

async function loadParentCatOptions(selected){
  const sel=document.getElementById('cat-parent');
  try{
    const{data}=await sb.from('supermarket_categories').select('name').is('parent_name',null).eq('is_active',true).order('sort_order');
    sel.innerHTML='<option value="">-- None (main category) --</option>'+
      (data||[]).map(c=>'<option value="'+c.name+'"'+(c.name===selected?' selected':'')+'>'+c.name+'</option>').join('');
  }catch(e){sel.innerHTML='<option value="">-- None --</option>';}
}

async function openEditCat(id){
  const{data}=await sb.from('supermarket_categories').select('*').eq('id',id).single();
  if(!data)return;
  document.getElementById('modal-cat-title').textContent='Edit category';
  document.getElementById('cat-edit-id').value=id;
  document.getElementById('cat-name').value=data.name||'';
  document.getElementById('cat-slug').value=data.slug||'';
  document.getElementById('cat-color').value=data.bg_color||'#f0fdf4';
  document.getElementById('cat-color-hex').value=data.bg_color||'#f0fdf4';
  document.getElementById('cat-order').value=data.sort_order||1;
  document.getElementById('cat-active').value=String(data.is_active);
  catImgUrl=data.image_url||'';
  if(catImgUrl){document.getElementById('cat-img-preview').src=catImgUrl;document.getElementById('cat-img-preview').style.display='block';document.getElementById('cat-img-ph').style.display='none';}
  await loadParentCatOptions(data.parent_name||'');
  showModal('modal-cat');
}

function handleCatImg(input){
  const file=input.files[0];if(!file)return;
  catImgFile=file;
  const r=new FileReader();
  r.onload=e=>{document.getElementById('cat-img-preview').src=e.target.result;document.getElementById('cat-img-preview').style.display='block';document.getElementById('cat-img-ph').style.display='none';};
  r.readAsDataURL(file);
}

async function saveCat(){
  const btn=document.getElementById('cat-save-btn');
  const err=document.getElementById('cat-err');
  const name=document.getElementById('cat-name').value.trim();
  if(!name){err.style.display='block';err.textContent='Name is required';return;}
  const slug=document.getElementById('cat-slug').value.trim().replace(/-+$/,'').replace(/-{2,}/g,'-');
  if(slug&&!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)){err.style.display='block';err.textContent='Web address: only small English letters, numbers and - (e.g. frozen-food)';return;}
  btn.innerHTML='<i class="ti ti-loader"></i> Saving...';btn.disabled=true;err.style.display='none';
  try{
    if(catImgFile){const url=await uploadImg(catImgFile,'categories');if(url)catImgUrl=url;}
    const payload={
      name,
      bg_color:document.getElementById('cat-color').value,
      sort_order:Number(document.getElementById('cat-order').value)||1,
      is_active:document.getElementById('cat-active').value==='true',
      image_url:catImgUrl||null,
      parent_name:document.getElementById('cat-parent').value||null,
      slug:slug||null,
    };
    const editId=document.getElementById('cat-edit-id').value;
    let supaErr, _moved=null;
    if(editId){
      // Renaming: the server renames the category AND moves its products + sub-categories with it (all at once)
      const cur=await sb.from('supermarket_categories').select('name').eq('id',editId).single();
      if(cur.error)throw new Error(cur.error.message);
      if(cur.data&&cur.data.name!==name){
        const rn=await sb.rpc('store_rename_category',{p_id:editId,p_name:name});
        if(rn.error)throw new Error(/exists/i.test(rn.error.message)?'A category with this name already exists — choose another name':rn.error.message);
        _moved=(rn.data&&rn.data.moved)||0;
      }
      const{error}=await sb.from('supermarket_categories').update(payload).eq('id',editId);supaErr=error;}
    else{const{error}=await sb.from('supermarket_categories').insert([payload]);supaErr=error;}
    if(supaErr)throw new Error(/slug/i.test(supaErr.message)&&/duplicate|unique/i.test(supaErr.message)?'This web address is already used by another category — choose another':supaErr.message);
    btn.innerHTML='<i class="ti ti-check"></i> Save category';btn.disabled=false;
    showToast(editId?(_moved!=null?'Category renamed ✓ — '+_moved+' products moved with it':'Category updated ✓'):'Category added ✓');
    closeModal('modal-cat');loadCats();
  }catch(e){err.style.display='block';err.textContent='Error: '+e.message;btn.innerHTML='<i class="ti ti-check"></i> Save category';btn.disabled=false;}
}

async function deleteCat(id,name){
  if(!confirm('Delete category "'+name+'"?'))return;
  await sb.from('supermarket_categories').delete().eq('id',id);
  loadCats();showToast('Category deleted');
}

// ══════════════════════════════════
// PRODUCTS
// ══════════════════════════════════
// ══ SUPERMARKET PRODUCTS — all products in memory: instant search, filters, edit in place, quick add ══
var PR={all:[],cats:[],q:'',f:'all',cat:'',shown:60,loaded:false,qt:null,lastCat:''};
try{ PR.lastCat=localStorage.getItem('pr_last_cat')||''; }catch(e){}
// Search forgives Arabic spelling: أ/إ/آ=ا · ة=ه · ى=ي · tashkeel ignored · Arabic digits = 0-9
function _prN(t){ return String(t||'').toLowerCase()
  .replace(/[ً-ْـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي')
  .replace(/[٠-٩]/g,function(d){ return String(d.charCodeAt(0)-1632); }).replace(/\s+/g,' ').trim(); }
function _prLeafCats(){
  var parents=new Set(PR.cats.map(function(c){ return c.parent_name; }).filter(Boolean)), seen=new Set();
  return PR.cats.filter(function(c){ if(parents.has(c.name)||seen.has(c.name))return false; seen.add(c.name); return true; });
}
async function loadProductsSection(){
  try{ var r=await sb.from('supermarket_categories').select('name,parent_name,image_url,sort_order').eq('is_active',true).order('sort_order'); if(r&&!r.error)PR.cats=r.data||[]; }catch(e){}
  var sel=document.getElementById('products-cat-filter');
  if(sel){ sel.innerHTML='<option value="">All categories</option>'+_prLeafCats().map(function(c){ return '<option value="'+escHtml(c.name)+'">'+escHtml(c.name)+'</option>'; }).join(''); sel.value=PR.cat; }
  await _prLoad();
}
// kept for older callers (category page "products" link, save/delete)
async function loadProductsByCategory(catName){
  PR.cat=catName||''; var sel=document.getElementById('products-cat-filter'); if(sel)sel.value=PR.cat;
  await _prLoad();
}
async function _prLoad(){
  var box=document.getElementById('products-table'); if(!box)return;
  if(!PR.loaded) box.innerHTML='<div class="loading">Loading products…</div>';
  var r=await _fetchAllRows(function(){ return sb.from('supermarket_products').select('id,name,name_en,price,image_url,in_stock,category_name,barcode,sort_order,created_at').eq('is_active',true).order('category_name').order('sort_order').order('id'); });
  if(r.error||!r.data){ if(!PR.loaded) box.innerHTML='<div class="empty-state" style="padding:2rem"><i class="ti ti-alert-circle"></i>Could not load products — check the internet and try again</div>'; return; }
  PR.all=r.data.map(_prPrep); PR.loaded=true; _prTwins(); prRender();
}
function _prPrep(p){ p._n=_prN(p.name+' '+(p.name_en||'')+' '+(p.barcode||'')); return p; }
function _prTwins(){ var c={}; PR.all.forEach(function(p){ var k=_prN(p.name); c[k]=(c[k]||0)+1; }); PR.all.forEach(function(p){ p._twin=c[_prN(p.name)]>1; }); }
var _PR_F={all:{l:'All',t:function(){ return true; }},
  nophoto:{l:'📷 No photo',t:function(p){ return !p.image_url; }},
  zero:{l:'0 price',t:function(p){ return !(Number(p.price)>0); }},
  out:{l:'Out of stock',t:function(p){ return !p.in_stock; }},
  twins:{l:'Twins',t:function(p){ return !!p._twin; }}};
// ── ADVANCED FILTER: type a sentence (Arabic or English) → understood as filters; or tap ⚙ Filters; then change all results at once ──
PR.adv={cats:[],min:null,max:null,photo:'',bc:'',stock:'',twins:false,sort:''};
var _PR_ALIAS={ // English / short words → category (used after "قسم / category / in")
  'chocolate':'شوكولاتة','choco':'شوكولاتة','galaxy':'جالكسي','dairy':'الألبان','milk':'الألبان','eggs':'الألبان','cheese':'الألبان',
  'drinks':'المشروبات','beverages':'المشروبات','soda':'مشروب غازي','soft drinks':'مشروب غازي','juice':'العصائر','juices':'العصائر','water':'مياه',
  'chips':'الشيبس','snacks':'الشيبس','nuts':'مكسرات','spices':'بهارات','bakery':'المخبوزات','bread':'المخبوزات','ice cream':'ايسكريم','icecream':'ايسكريم',
  'cleaning':'التنظيف','baby':'الطفل','coffee':'القهوة','tea':'القهوة','canned':'المعلبات','cans':'المعلبات','rice':'أرز','pasta':'معكرونة',
  'sauces':'صلصات','sauce':'صلصات','meat':'لحوم','chicken':'لحوم','fruits':'فواكه','fruit':'فواكه','vegetables':'خضروات','veg':'خضروات',
  'kitchen':'أدوات المطبخ','tools':'أدوات المطبخ','beauty':'الجمال','health':'الصحة','cooking':'مستلزمات الطبخ','juice shop':'عصائر وحلويات طازجة',
  'dessert':'عصائر وحلويات طازجة','desserts':'عصائر وحلويات طازجة','حلويات':'عصائر وحلويات طازجة','ألبان':'الألبان','لبن':'الألبان','مشروبات':'المشروبات',
  'عصير':'العصائر','عصائر':'العصائر','غازي':'مشروب غازي','مياه':'مياه','ماء':'مياه','شيبس':'الشيبس','بهارات':'بهارات','مكسرات':'مكسرات','خبز':'المخبوزات',
  'معلبات':'المعلبات','لحوم':'لحوم','دجاج':'لحوم','فواكه':'فواكه','خضار':'خضروات','خضروات':'خضروات','قهوه':'القهوة','شاي':'القهوة','تنظيف':'التنظيف','اطفال':'الطفل'};
var _PRN='(\\d+(?:\\.\\d+)?)', _PRCUR='(?:\\s*(?:ريال|ر\\.?س|sar|rs|riyal|sr))?';
function _prCatMatch(phrase){
  phrase=_prN(phrase).trim(); if(phrase.length<2)return null;
  var cats=PR.cats, alias=_PR_ALIAS[phrase]?_prN(_PR_ALIAS[phrase]):null;
  var hit=cats.find(function(c){ return _prN(c.name)===phrase; })
       ||cats.find(function(c){ return alias&&_prN(c.name).indexOf(alias)>=0; })
       ||(phrase.length>=3?cats.find(function(c){ return _prN(c.name).indexOf(phrase)>=0; }):null);
  return hit?hit.name:null;
}
function _prCatLeaves(name){ // a parent category means all categories inside it
  var kids=PR.cats.filter(function(c){ return c.parent_name===name; }).map(function(c){ return c.name; });
  return kids.length?kids:[name];
}
// Turns what the admin typed into filters. Everything not understood stays as name words.
function _prParse(q){
  var t=' '+_prN(q).replace(/[،,]/g,' ').replace(/\s+/g,' ')+' ', R={words:[],cats:[],min:null,max:null,photo:'',bc:'',stock:'',twins:false,zero:false,sort:'',parts:[]};
  function take(re,fn){ t=t.replace(re,function(){ var a=arguments, m=a[0]; var lab=fn.apply(null,a); if(lab===false)return m; if(lab)R.parts.push({label:lab,src:m.trim()}); return ' '; }); }
  // price
  take(new RegExp('(?:^| )(?:بين|between|from|من) '+_PRN+_PRCUR+' ?(?:و|and|to|الي|لين|-|–) ?'+_PRN+_PRCUR+'(?= |$)','g'),function(m,a,b){ a=+a; b=+b; R.min=Math.min(a,b); R.max=Math.max(a,b); return '💰 '+R.min+'–'+R.max+' SAR'; });
  take(new RegExp('(?:^| )'+_PRN+' ?- ?'+_PRN+'(?: ?(?:ريال|ر\\.?س|sar|rs|sr))(?= |$)','g'),function(m,a,b){ a=+a; b=+b; R.min=Math.min(a,b); R.max=Math.max(a,b); return '💰 '+R.min+'–'+R.max+' SAR'; });
  take(/(?:^| )(?:بدون سعر|بلا سعر|سعر صفر|سعر 0|zero price|no price|0 price|price 0|free)(?= |$)/g,function(){ R.zero=true; return '💰 price 0'; });
  take(new RegExp('(?:^| )(?:اقل من|اصغر من|ارخص من|تحت|دون|under|below|less than|cheaper than|max|maximum|up to|حتي|لحد|<=?) ?'+_PRN+_PRCUR+'(?= |$)','g'),function(m,a){ R.max=+a; return '💰 under '+(+a)+' SAR'; });
  take(new RegExp('(?:^| )(?:اكثر من|اكبر من|اغلي من|فوق|اعلي من|over|above|more than|greater than|min|minimum|from|>=?) ?'+_PRN+_PRCUR+'(?= |$)','g'),function(m,a){ R.min=+a; return '💰 over '+(+a)+' SAR'; });
  take(new RegExp('(?:^| )(?:بسعر|سعر|سعره|price|priced|=) ?'+_PRN+_PRCUR+'(?= |$)','g'),function(m,a){ R.min=R.max=+a; return '💰 = '+(+a)+' SAR'; });
  // photo, barcode
  take(/(?:^| )(?:بدون|بلا|من غير|ما فيه|مافيه|ماله|no|without|missing|not|no have) (?:صوره|صور|الصوره|image|images|photo|photos|picture|pictures|pic|pics)(?= |$)/g,function(){ R.photo='without'; return '📷 no photo'; });
  take(/(?:^| )(?:مع|فيه|فيها|له|with|has|have|having) (?:صوره|صور|الصوره|image|images|photo|photos|picture|pic)(?= |$)/g,function(){ R.photo='with'; return '📷 has photo'; });
  take(/(?:^| )(?:بدون|بلا|من غير|ما فيه|مافيه|no|without|missing) (?:باركود|الباركود|barcode|barcodes|bar code)(?= |$)/g,function(){ R.bc='without'; return '🏷 no barcode'; });
  take(/(?:^| )(?:مع|فيه|له|with|has|have) (?:باركود|الباركود|barcode|bar code)(?= |$)/g,function(){ R.bc='with'; return '🏷 has barcode'; });
  // stock (check "not available" before "available")
  take(/(?:^| )(?:غير متوفر|مو متوفر|ما متوفر|مب متوفر|نفد|نفذ|خلص|خالص|out of stock|sold out|unavailable|not available|out)(?= |$)/g,function(){ R.stock='out'; return '📦 out of stock'; });
  take(/(?:^| )(?:متوفر|المتوفر|in stock|available)(?= |$)/g,function(){ R.stock='in'; return '📦 in stock'; });
  // twins
  take(/(?:^| )(?:مكرر|مكرره|المكرر|مكررات|تكرار|duplicate|duplicates|duplicated|twins?|repeated|double)(?= |$)/g,function(){ R.twins=true; return '👯 twins'; });
  // sort
  take(/(?:^| )(?:الارخص|ارخص|الاقل سعر|اقل سعر|cheapest|cheap first|low to high|lowest price|price low)(?= |$)/g,function(){ R.sort='price_asc'; return '↕ cheapest first'; });
  take(/(?:^| )(?:الاغلي|اغلي|الاعلي سعر|اعلي سعر|most expensive|expensive first|high to low|highest price|price high)(?= |$)/g,function(){ R.sort='price_desc'; return '↕ most expensive first'; });
  take(/(?:^| )(?:ابجدي|حسب الاسم|بالاسم|a-z|alphabetical|by name|sort name)(?= |$)/g,function(){ R.sort='name'; return '↕ by name'; });
  take(/(?:^| )(?:الاحدث|الجديده|المضافه حديثا|اخر المضاف|newest|latest|recently added|new first)(?= |$)/g,function(){ R.sort='new'; return '↕ newest first'; });
  // category: "قسم X" / "category X" / "in X" (up to 4 words) …
  var _back=[];
  take(/(?:^| )(?:قسم|فئه|تصنيف|كاتيجوري|category|cat|in|من قسم|في قسم) ((?:[^ ]+ ?){1,4})/g,function(m,ph){
    var w=ph.trim().split(' ');
    for(var n=w.length;n>0;n--){ var c=_prCatMatch(w.slice(0,n).join(' ')); if(c){ R.cats=R.cats.concat(_prCatLeaves(c)); var rest=w.slice(n).join(' '); if(rest)_back.push(rest); return '📂 '+c; } }
    return false; });
  if(_back.length)t+=' '+_back.join(' ')+' ';
  // … or a full category name typed as it is
  PR.cats.slice().sort(function(a,b){ return b.name.length-a.name.length; }).forEach(function(c){
    var cn=_prN(c.name); if(cn.length<4)return;
    var i=t.indexOf(' '+cn+' '); if(i<0)return;
    t=t.slice(0,i)+' '+t.slice(i+cn.length+1); R.cats=R.cats.concat(_prCatLeaves(c.name)); R.parts.push({label:'📂 '+c.name,src:cn}); });
  // what's left = name words (small filler words dropped)
  var FILL={'ال':1,'في':1,'من':1,'و':1,'اللي':1,'الي':1,'التي':1,'كل':1,'منتجات':1,'منتج':1,'اعرض':1,'عرض':1,'ابي':1,'ابغي':1,'ابغا':1,'ريال':1,'ر.س':1,'sar':1,'rs':1,'show':1,'me':1,'all':1,'the':1,'and':1,'with':1,'products':1,'product':1,'items':1,'item':1,'that':1,'are':1,'is':1,'list':1,'find':1,'هات':1,'وش':1,'ايش':1};
  R.words=t.split(' ').filter(function(w){ return w&&!FILL[w]; });
  if(R.words.length)R.parts.push({label:'🔤 "'+R.words.join(' ')+'"',src:null,words:true});
  return R;
}
// Remove one understood part from the search box (works with أ/ا, ة/ه, ى/ي written either way)
function _prLoose(src){ return src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ا/g,'[اأإآٱ]').replace(/ه/g,'[هة]').replace(/ي/g,'[يى]').replace(/و/g,'[وؤ]').replace(/ /g,'\\s+'); }
function prDropPart(i){
  var R=_prParse(PR.q), p=R.parts[i]; if(!p)return;
  var inp=document.getElementById('pr-q'), v=inp.value;
  if(p.words){ R.words.forEach(function(w){ v=v.replace(new RegExp('(^|\\s)'+_prLoose(w)+'(?=\\s|$)','i'),' '); }); }
  else v=v.replace(new RegExp(_prLoose(p.src),'i'),' ');
  v=v.replace(/\s+/g,' ').trim(); inp.value=v; PR.q=v; PR.shown=60; prRender();
}
function _prAdvCount(){ var a=PR.adv; return (a.cats.length?1:0)+(a.min!=null||a.max!=null?1:0)+(a.photo?1:0)+(a.bc?1:0)+(a.stock?1:0)+(a.twins?1:0)+(a.sort?1:0); }
// One test for a product: typed sentence + ⚙ panel + quick chip
function _prList(){
  var R=_prParse(PR.q), A=PR.adv;
  var cats=R.cats.length?R.cats:null, acats=A.cats.length?A.cats:null;
  var list=PR.all.filter(function(p){
    var pr=Number(p.price)||0;
    if(PR.cat&&p.category_name!==PR.cat)return false;
    if(cats&&cats.indexOf(p.category_name)<0)return false;
    if(acats&&acats.indexOf(p.category_name)<0)return false;
    if(!R.words.every(function(w){ return p._n.indexOf(w)>=0; }))return false;
    if(R.min!=null&&pr<R.min)return false; if(R.max!=null&&pr>R.max)return false;
    if(A.min!=null&&pr<A.min)return false; if(A.max!=null&&pr>A.max)return false;
    if(R.zero&&pr>0)return false;
    var ph=R.photo||A.photo; if(ph==='with'&&!p.image_url)return false; if(ph==='without'&&p.image_url)return false;
    var bc=R.bc||A.bc; if(bc==='with'&&!p.barcode)return false; if(bc==='without'&&p.barcode)return false;
    var st=R.stock||A.stock; if(st==='in'&&!p.in_stock)return false; if(st==='out'&&p.in_stock)return false;
    if((R.twins||A.twins)&&!p._twin)return false;
    return true; });
  var counts={}; Object.keys(_PR_F).forEach(function(k){ counts[k]=list.filter(_PR_F[k].t).length; });
  list=list.filter(_PR_F[PR.f].t);
  var sort=R.sort||A.sort||(PR.f==='twins'||R.twins||A.twins?'twin':'');
  var num=function(p){ return Number(p.price)||0; };
  if(sort==='price_asc')list.sort(function(a,b){ return num(a)-num(b); });
  else if(sort==='price_desc')list.sort(function(a,b){ return num(b)-num(a); });
  else if(sort==='name')list.sort(function(a,b){ return String(a.name).localeCompare(String(b.name),'ar'); });
  else if(sort==='new')list.sort(function(a,b){ return String(b.created_at||'').localeCompare(String(a.created_at||'')); });
  else if(sort==='twin')list.sort(function(a,b){ return _prN(a.name).localeCompare(_prN(b.name)); });
  return {list:list,counts:counts,R:R};
}
function prRender(){
  var box=document.getElementById('products-table'); if(!box||!PR.loaded)return;
  var r=_prList(), list=r.list, counts=r.counts, R=r.R;
  PR.lastList=list;
  document.getElementById('pr-total').textContent=PR.all.length.toLocaleString('en-US')+' products';
  document.getElementById('pr-chips').innerHTML=Object.keys(_PR_F).map(function(k){
    return '<button type="button" class="pr-chip'+(PR.f===k?' on':'')+(k!=='all'&&counts[k]?' warn':'')+'" onclick="prSetFilter(\''+k+'\')">'+_PR_F[k].l+' <b>'+counts[k]+'</b></button>'; }).join('');
  var n=_prAdvCount(), fb=document.getElementById('pr-fbtn'); if(fb)fb.innerHTML='<i class="ti ti-adjustments-horizontal"></i> Filters'+(n?' <b>'+n+'</b>':'');
  var und=document.getElementById('pr-und');
  var smart=R.parts.filter(function(p){ return !p.words; }).length>0;
  if(und) und.innerHTML=R.parts.length&&(smart||R.words.length)?'<span class="pr-und-l">'+(smart?'Understood:':'Searching:')+'</span>'+R.parts.map(function(p,i){ return '<span class="pr-und-c">'+escHtml(p.label)+'<button type="button" onclick="prDropPart('+i+')" aria-label="Remove">✕</button></span>'; }).join(''):'';
  var filtered=!!(PR.q.trim()||PR.cat||PR.f!=='all'||n);
  document.getElementById('pr-bulk').innerHTML=filtered&&list.length?'<span><b>'+list.length.toLocaleString('en-US')+'</b> '+(list.length===1?'product':'products')+' found</span><button type="button" class="pr-bulk-b" onclick="prBulk()"><i class="ti ti-bolt"></i> Change all '+list.length.toLocaleString('en-US')+'</button>':'';
  if(!list.length){
    box.innerHTML='<div class="empty-state" style="padding:2rem"><i class="ti ti-package"></i>'+(filtered?'No product matches — try fewer words'+(PR.q?' or <a style="color:var(--rose);font-weight:700;cursor:pointer" onclick="prQuickAdd()">add it</a>':''):'Nothing here 🎉')+'</div>';
    document.getElementById('pr-more').innerHTML=''; return;
  }
  box.innerHTML='<div class="pr-list">'+list.slice(0,PR.shown).map(_prRow).join('')+'</div>';
  var left=list.length-PR.shown;
  document.getElementById('pr-more').innerHTML=left>0?'<button type="button" class="pr-morebtn" onclick="PR.shown+=60;prRender()">Show more ('+left+' left)</button>':'';
}

// ── ⚙ Filters panel (tap instead of typing) ──
function _prSeg(id,opts,val){ return '<div class="prf-seg" id="'+id+'">'+opts.map(function(o){ return '<button type="button" data-v="'+o[0]+'" class="'+(o[0]===val?'on':'')+'" onclick="_prSegPick(this)">'+o[1]+'</button>'; }).join('')+'</div>'; }
function _prSegPick(b){ b.parentNode.querySelectorAll('button').forEach(function(x){ x.classList.toggle('on',x===b); }); }
function _prSegVal(id){ var b=document.querySelector('#'+id+' button.on'); return b?b.getAttribute('data-v'):''; }
function prFilters(){
  var A=PR.adv, ov=document.getElementById('prf-ov');
  if(!ov){ ov=document.createElement('div'); ov.className='pra-ov'; ov.id='prf-ov'; ov.addEventListener('click',function(e){ if(e.target===ov)prFiltersClose(); }); document.body.appendChild(ov); }
  var cats=PR.cats.filter(function(c,i,a){ return a.findIndex(function(x){ return x.name===c.name; })===i; });
  ov.innerHTML='<div class="pra" role="dialog" aria-label="Filters">'+
    '<div class="pra-hd"><b>Filters</b><button type="button" class="pra-x" onclick="prFiltersClose()" aria-label="Close"><i class="ti ti-x"></i></button></div>'+
    '<div class="pra-l">Categories (tap one or more)</div><div class="prf-cats" id="prf-cats">'+cats.map(function(c){ var on=A.cats.indexOf(c.name)>=0||(_prCatLeaves(c.name).every(function(x){ return A.cats.indexOf(x)>=0; })&&A.cats.length>0&&_prCatLeaves(c.name)[0]!==c.name);
      return '<button type="button" class="pr-chip'+(on?' on':'')+'" data-c="'+escHtml(c.name)+'" onclick="this.classList.toggle(\'on\')">'+escHtml(c.name)+'</button>'; }).join('')+'</div>'+
    '<div class="pra-l">Price (SAR)</div><div class="pra-row"><input class="pra-in" id="prf-min" type="number" inputmode="decimal" min="0" step="0.25" placeholder="From" value="'+(A.min!=null?A.min:'')+'"/><span>–</span><input class="pra-in" id="prf-max" type="number" inputmode="decimal" min="0" step="0.25" placeholder="To" value="'+(A.max!=null?A.max:'')+'"/></div>'+
    '<div class="pra-l">Photo</div>'+_prSeg('prf-photo',[['','Any'],['with','Has photo'],['without','No photo']],A.photo)+
    '<div class="pra-l">Barcode</div>'+_prSeg('prf-bc',[['','Any'],['with','Has barcode'],['without','No barcode']],A.bc)+
    '<div class="pra-l">Stock</div>'+_prSeg('prf-stock',[['','Any'],['in','In stock'],['out','Out of stock']],A.stock)+
    '<div class="pra-l">Duplicates</div>'+_prSeg('prf-twins',[['','Any'],['1','Only twins']],A.twins?'1':'')+
    '<div class="pra-l">Sort</div>'+_prSeg('prf-sort',[['','Default'],['price_asc','Cheapest'],['price_desc','Most expensive'],['name','Name'],['new','Newest']],A.sort)+
    '<button type="button" class="pra-go main" onclick="prFiltersApply()">Show results</button>'+
    '<button type="button" class="pra-go sec" onclick="prFiltersReset()">Clear all filters</button></div>';
  ov.classList.add('show'); document.body.classList.add('m-lock');
}
function prFiltersClose(){ var o=document.getElementById('prf-ov'); if(o)o.classList.remove('show'); document.body.classList.remove('m-lock'); }
function prFiltersApply(){
  var cats=[]; document.querySelectorAll('#prf-cats .pr-chip.on').forEach(function(b){ cats=cats.concat(_prCatLeaves(b.getAttribute('data-c'))); });
  var mn=document.getElementById('prf-min').value, mx=document.getElementById('prf-max').value;
  PR.adv={cats:cats.filter(function(c,i,a){ return a.indexOf(c)===i; }),min:mn===''?null:+mn,max:mx===''?null:+mx,photo:_prSegVal('prf-photo'),bc:_prSegVal('prf-bc'),stock:_prSegVal('prf-stock'),twins:_prSegVal('prf-twins')==='1',sort:_prSegVal('prf-sort')};
  PR.shown=60; prFiltersClose(); prRender();
}
function prFiltersReset(){ PR.adv={cats:[],min:null,max:null,photo:'',bc:'',stock:'',twins:false,sort:''}; PR.f='all'; PR.cat=''; var s=document.getElementById('products-cat-filter'); if(s)s.value=''; PR.shown=60; prFiltersClose(); prRender(); }

// ── ⚡ Change all results at once: price, category, stock, remove from shop ──
function prBulk(){
  var list=(PR.lastList||[]).slice(); if(!list.length)return;
  var ov=document.getElementById('prb-ov');
  if(!ov){ ov=document.createElement('div'); ov.className='pra-ov'; ov.id='prb-ov'; ov.addEventListener('click',function(e){ if(e.target===ov&&!PR.bulkBusy)prBulkClose(); }); document.body.appendChild(ov); }
  PR.bulkIds=list.map(function(p){ return String(p.id); });
  var leaves=_prLeafCats(), N=list.length.toLocaleString('en-US');
  ov.innerHTML='<div class="pra" role="dialog" aria-label="Change products">'+
    '<div class="pra-hd"><b>Change '+N+' products</b><button type="button" class="pra-x" onclick="prBulkClose()" aria-label="Close"><i class="ti ti-x"></i></button></div>'+
    '<div class="prb-tabs">'+[['price','💰 Price'],['cat','📂 Category'],['stock','📦 Stock'],['remove','🗑 Remove']].map(function(t,i){ return '<button type="button" class="'+(i?'':'on')+'" data-t="'+t[0]+'" onclick="_prbTab(this)">'+t[1]+'</button>'; }).join('')+'</div>'+
    '<div class="prb-pane" data-p="price"><div class="pra-row"><select class="pra-in" id="prb-mode" style="flex:1.3" onchange="_prbPreview()"><option value="pct_up">Raise by %</option><option value="pct_down">Lower by %</option><option value="add">Add SAR</option><option value="sub">Take off SAR</option><option value="set">Set price to</option></select>'+
      '<input class="pra-in" id="prb-val" type="number" inputmode="decimal" min="0" step="0.25" placeholder="0" style="flex:1" oninput="_prbPreview()"/></div><div class="prb-prev" id="prb-prev"></div>'+
      '<button type="button" class="pra-go main" onclick="prBulkRun(\'price\')">Change prices</button></div>'+
    '<div class="prb-pane" data-p="cat" style="display:none"><select class="pra-in" id="prb-cat"><option value="">Choose a category…</option>'+leaves.map(function(c){ return '<option value="'+escHtml(c.name)+'">'+escHtml(c.name)+'</option>'; }).join('')+'</select>'+
      '<button type="button" class="pra-go main" onclick="prBulkRun(\'cat\')">Move '+N+' products</button></div>'+
    '<div class="prb-pane" data-p="stock" style="display:none"><button type="button" class="pra-go main" style="background:#16a34a" onclick="prBulkRun(\'in\')">Mark all in stock</button><button type="button" class="pra-go sec" onclick="prBulkRun(\'out\')">Mark all out of stock</button></div>'+
    '<div class="prb-pane" data-p="remove" style="display:none"><div class="prb-prev">They disappear from the shop and this list. Nothing is deleted for ever — they can be brought back.</div>'+
      '<button type="button" class="pra-go main" style="background:#dc2626" id="prb-rm" onclick="prBulkRun(\'remove\')">Remove '+N+' products from the shop</button></div>'+
    '<div class="pra-err" id="prb-msg"></div></div>';
  ov.classList.add('show'); document.body.classList.add('m-lock'); _prbPreview();
}
function _prbTab(b){ document.querySelectorAll('#prb-ov .prb-tabs button').forEach(function(x){ x.classList.toggle('on',x===b); }); document.querySelectorAll('#prb-ov .prb-pane').forEach(function(p){ p.style.display=p.getAttribute('data-p')===b.getAttribute('data-t')?'':'none'; }); document.getElementById('prb-msg').textContent=''; }
function prBulkClose(){ var o=document.getElementById('prb-ov'); if(o)o.classList.remove('show'); document.body.classList.remove('m-lock'); }
function _prbNew(old){
  var m=document.getElementById('prb-mode').value, v=Number(String(document.getElementById('prb-val').value).replace(',','.')); if(!(v>=0)||document.getElementById('prb-val').value==='')return null;
  var n=m==='pct_up'?old*(1+v/100):m==='pct_down'?old*(1-v/100):m==='add'?old+v:m==='sub'?old-v:v;
  return Math.round(n*100)/100;
}
function _prbPreview(){
  var el=document.getElementById('prb-prev'); if(!el)return;
  var ex=PR.bulkIds.slice(0,3).map(_prFind).filter(Boolean);
  var lines=ex.map(function(p){ var o=Number(p.price)||0, n=_prbNew(o); return n==null?'':'<div><bdi>'+escHtml(p.name)+'</bdi>: '+o.toFixed(2)+' → <b'+(n>0?'':' style="color:#b91c1c"')+'>'+n.toFixed(2)+'</b></div>'; }).join('');
  el.innerHTML=lines?'<div style="font-weight:700;margin-bottom:3px">Example:</div>'+lines:'Type a number to see the new prices';
}
async function _prbEach(items,fn,label){ // a few at a time, with progress
  var done=0, fail=0, msg=document.getElementById('prb-msg'), i=0;
  async function worker(){ while(i<items.length){ var it=items[i++]; try{ var r=await fn(it); if(r&&r.error)fail++; }catch(e){ fail++; } done++; if(msg)msg.textContent=label+' '+done+' / '+items.length+'…'; } }
  await Promise.all([1,2,3,4,5,6].map(worker)); return fail;
}
function _prbChunks(ids){ var c=[]; for(var i=0;i<ids.length;i+=100)c.push(ids.slice(i,i+100)); return c; }
async function prBulkRun(kind){
  if(PR.bulkBusy)return;
  var ids=PR.bulkIds||[], msg=document.getElementById('prb-msg'), N=ids.length;
  if(kind==='remove'){ var b=document.getElementById('prb-rm'); if(!b.dataset.sure){ b.dataset.sure='1'; b.textContent='Tap again to remove '+N+' products'; return; } }
  var patch=null;
  if(kind==='cat'){ var c=document.getElementById('prb-cat').value; if(!c){ msg.textContent='Choose a category first'; return; } patch={category_name:c}; }
  if(kind==='in')patch={in_stock:true}; if(kind==='out')patch={in_stock:false}; if(kind==='remove')patch={is_active:false};
  if(kind==='price'&&_prbNew(1)==null){ msg.textContent='Type a number first'; return; }
  PR.bulkBusy=true; var fail=0;
  if(kind==='price'){
    var items=ids.map(_prFind).filter(Boolean).map(function(p){ return {p:p,n:_prbNew(Number(p.price)||0)}; });
    var bad=items.filter(function(x){ return !(x.n>0); }); items=items.filter(function(x){ return x.n>0; });
    fail=await _prbEach(items,function(x){ return sb.from('supermarket_products').update({price:x.n}).eq('id',x.p.id).then(function(r){ if(!r.error)x.p.price=x.n; return r; }); },'Saving');
    PR.bulkBusy=false; prBulkClose(); prRender();
    showToast((items.length-fail)+' prices changed'+(bad.length?' · '+bad.length+' skipped (would be 0 or less)':'')+(fail?' · '+fail+' not saved':''));
    return;
  }
  fail=await _prbEach(_prbChunks(ids),function(ch){ return sb.from('supermarket_products').update(patch).in('id',ch).then(function(r){
      if(!r.error) ch.forEach(function(id){ var p=_prFind(id); if(p)Object.assign(p,patch); });
      return r; }); },'Saving');
  if(kind==='remove'){ var gone={}; ids.forEach(function(id){ var p=_prFind(id); if(p&&p.is_active===false)gone[id]=1; }); PR.all=PR.all.filter(function(p){ return !gone[String(p.id)]; }); _prTwins(); }
  PR.bulkBusy=false; prBulkClose(); prRender();
  var what={cat:'moved',in:'marked in stock',out:'marked out of stock',remove:'removed from the shop'}[kind];
  showToast(fail?'Some were not saved — check the internet and try again':N+' products '+what+' ✓');
}

function _prRow(p){
  var id=escHtml(String(p.id)), price=Number(p.price)||0;
  return '<div class="pr-row" data-id="'+id+'">'+
    '<button type="button" class="pr-img'+(p.image_url?'':' none')+'" onclick="prPhoto(\''+id+'\')" title="'+(p.image_url?'Change photo':'Add photo')+'">'+(p.image_url?'<img src="'+escHtml(p.image_url)+'" alt="" loading="lazy"/>':'<i class="ti ti-camera-plus"></i>')+'</button>'+
    '<div class="pr-info" onclick="openEditSP(\''+id+'\')"><div class="pr-name">'+escHtml(p.name)+'</div>'+
      '<div class="pr-sub">'+escHtml(p.category_name||'')+(p.name_en?' · <span dir="ltr">'+escHtml(p.name_en)+'</span>':'')+(p.barcode?' · <span dir="ltr">#'+escHtml(p.barcode)+'</span>':'')+(p._twin?' · <span class="pr-twin">twin</span>':'')+'</div></div>'+
    '<button type="button" class="pr-price'+(price>0?'':' zero')+'" onclick="prEditPrice(\''+id+'\',this)" title="Change price">'+price.toFixed(2)+'</button>'+
    '<button type="button" class="pr-tg'+(p.in_stock?' on':'')+'" onclick="prStock(\''+id+'\')" title="'+(p.in_stock?'In stock — tap for out of stock':'Out of stock — tap for in stock')+'" aria-label="In stock"><i></i></button>'+
    '<button type="button" class="icon-btn icon-btn-rose" onclick="openEditSP(\''+id+'\')" title="Edit"><i class="ti ti-edit"></i></button>'+
  '</div>';
}
function _prFind(id){ return PR.all.find(function(p){ return String(p.id)===String(id); }); }
function prSearch(v){ clearTimeout(PR.qt); PR.qt=setTimeout(function(){ PR.q=v||''; PR.shown=60; prRender(); },120); }
function prSetFilter(k){ PR.f=k; PR.shown=60; prRender(); }
function prSetCat(v){ PR.cat=v||''; PR.shown=60; prRender(); }

// Price: tap → type → Enter (or tap elsewhere) saves
function prEditPrice(id,btn){
  var p=_prFind(id); if(!p)return;
  var inp=document.createElement('input'); inp.type='number'; inp.inputMode='decimal'; inp.step='0.25'; inp.min='0'; inp.className='pr-pin'; inp.value=Number(p.price)>0?String(p.price):'';
  btn.replaceWith(inp); inp.focus(); inp.select();
  var done=false;
  async function save(){
    if(done)return; done=true;
    var v=Number(String(inp.value).replace(',','.'));
    if(!(v>0)){ if(String(inp.value).trim()!=='')showToast('Price must be more than 0'); prRender(); return; }
    if(v===Number(p.price)){ prRender(); return; }
    var old=p.price; p.price=v; prRender();
    var r=await sb.from('supermarket_products').update({price:v}).eq('id',p.id);
    if(r&&r.error){ p.price=old; prRender(); showToast('Not saved — check the internet'); } else showToast('Price saved: '+v.toFixed(2)+' SAR');
  }
  inp.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); save(); } if(e.key==='Escape'){ done=true; prRender(); } });
  inp.addEventListener('blur',save);
}
async function prStock(id){
  var p=_prFind(id); if(!p)return;
  var nv=!p.in_stock; p.in_stock=nv; prRender();
  var r=await sb.from('supermarket_products').update({in_stock:nv}).eq('id',p.id);
  if(r&&r.error){ p.in_stock=!nv; prRender(); showToast('Not saved — check the internet'); } else showToast(nv?'In stock ✓':'Out of stock');
}
async function toggleSPStock(id){ return prStock(id); }
// Photo: tap the picture → camera or gallery → made small → saved
function prPhoto(id){
  var p=_prFind(id); if(!p)return;
  var f=document.createElement('input'); f.type='file'; f.accept='image/*';
  f.onchange=async function(){
    var file=f.files&&f.files[0]; if(!file)return;
    var cell=document.querySelector('.pr-row[data-id="'+CSS.escape(String(id))+'"] .pr-img'); if(cell)cell.classList.add('busy');
    showToast('Uploading photo…');
    var url=await uploadImg(file,'supermarket');
    if(!url){ if(cell)cell.classList.remove('busy'); showToast('Photo not uploaded — try again'); return; }
    var r=await sb.from('supermarket_products').update({image_url:url}).eq('id',p.id);
    if(r&&r.error){ if(cell)cell.classList.remove('busy'); showToast('Not saved — check the internet'); return; }
    p.image_url=url; prRender(); showToast('Photo saved ✓');
  };
  f.click();
}

// ── Quick add: barcode → no twins → name, price, category tile, photo → Save & add next ──
var _pra={file:null};
function _praBuild(){
  if(document.getElementById('pra-ov'))return;
  var ov=document.createElement('div'); ov.className='pra-ov'; ov.id='pra-ov';
  ov.innerHTML='<div class="pra" role="dialog" aria-label="New product">'+
    '<div class="pra-hd"><b>New product</b><button type="button" class="pra-x" onclick="prQuickClose()" aria-label="Close"><i class="ti ti-x"></i></button></div>'+
    '<div class="pra-l">Barcode (optional)</div>'+
    '<div class="pra-row"><input class="pra-in" id="pra-bc" inputmode="numeric" autocomplete="off" placeholder="Scan or type" dir="ltr" style="flex:1" oninput="_praCheck()"/>'+
      '<button type="button" class="pra-scan" onclick="prScan(\'add\')"><i class="ti ti-barcode"></i> Scan</button></div>'+
    '<div class="pra-st" id="pra-bc-st"></div>'+
    '<div class="pra-l">Name</div><input class="pra-in" id="pra-name" dir="auto" autocomplete="off" placeholder="مثال: نادك زبادي طازج 170 جم" oninput="_praCheck()"/>'+
    '<div class="pra-st" id="pra-name-st"></div>'+
    '<div class="pra-l">Price (SAR)</div><input class="pra-in" id="pra-price" type="number" inputmode="decimal" step="0.25" min="0" placeholder="0.00" dir="ltr" oninput="document.getElementById(\'pra-err\').textContent=\'\'"/>'+
    '<div class="pra-l">Category</div><div class="pra-cats" id="pra-cats"></div>'+
    '<div class="pra-l">Photo (optional)</div>'+
    '<div class="pra-photo"><img class="pra-prev" id="pra-prev" alt=""/>'+
      '<label class="pra-pbtn"><i class="ti ti-camera"></i>Take photo<input type="file" accept="image/*" capture="environment" style="display:none" onchange="_praPhoto(this)"/></label>'+
      '<label class="pra-pbtn"><i class="ti ti-photo"></i>From gallery<input type="file" accept="image/*" style="display:none" onchange="_praPhoto(this)"/></label></div>'+
    '<div class="pra-err" id="pra-err"></div>'+
    '<button type="button" class="pra-go main" id="pra-next" onclick="prQuickSave(true)">Save &amp; add next</button>'+
    '<button type="button" class="pra-go sec" id="pra-done" onclick="prQuickSave(false)">Save &amp; close</button>'+
  '</div>';
  ov.addEventListener('click',function(e){ if(e.target===ov)prQuickClose(); });
  document.body.appendChild(ov);
}
function _praCats(){
  var leaves=_prLeafCats(), cur=PR.lastCat;
  if(!leaves.some(function(c){ return c.name===cur; })) cur=PR.cat||'';
  document.getElementById('pra-cats').innerHTML=leaves.map(function(c){
    return '<button type="button" class="pra-cat'+(c.name===cur?' on':'')+'" data-c="'+escHtml(c.name)+'" onclick="_praPick(this)">'+
      (c.image_url?'<img src="'+escHtml(c.image_url)+'" alt="" loading="lazy"/>':'<span class="e">🛒</span>')+escHtml(c.name)+'</button>'; }).join('');
}
function _praPick(el){ document.getElementById('pra-err').textContent=''; document.querySelectorAll('#pra-cats .pra-cat').forEach(function(x){ x.classList.toggle('on',x===el); }); }
function _praCat(){ var on=document.querySelector('#pra-cats .pra-cat.on'); return on?on.getAttribute('data-c'):''; }
function _praReset(keepCat){
  ['pra-bc','pra-name','pra-price'].forEach(function(i){ document.getElementById(i).value=''; });
  ['pra-bc-st','pra-name-st','pra-err'].forEach(function(i){ var e=document.getElementById(i); e.className=i==='pra-err'?'pra-err':'pra-st'; e.innerHTML=''; });
  _pra.file=null; var pv=document.getElementById('pra-prev'); pv.style.display='none'; pv.removeAttribute('src');
  if(!keepCat)_praCats();
}
async function prQuickAdd(){
  _praBuild();
  if(!PR.cats.length||!PR.loaded){ await loadProductsSection(); }
  _praReset(false);
  document.getElementById('pra-ov').classList.add('show'); document.body.classList.add('m-lock');
  setTimeout(function(){ var n=document.getElementById('pra-name'); if(n&&window.matchMedia('(min-width:769px)').matches)n.focus(); },60);
}
function prQuickClose(){ var o=document.getElementById('pra-ov'); if(o)o.classList.remove('show'); document.body.classList.remove('m-lock'); }
function _praOpen(id){ prQuickClose(); openEditSP(id); }
// Same barcode = same product (never a twin). Same name = warning (sizes differ sometimes).
function _praCheck(){
  var bc=document.getElementById('pra-bc').value.trim(), nm=_prN(document.getElementById('pra-name').value);
  var bst=document.getElementById('pra-bc-st'), nst=document.getElementById('pra-name-st');
  var hit=bc?PR.all.find(function(p){ return String(p.barcode||'').trim()===bc; }):null;
  if(hit){ bst.className='pra-st dup'; bst.innerHTML='Already in your list: <bdi>'+escHtml(hit.name)+'</bdi> · '+(Number(hit.price)||0).toFixed(2)+' SAR <a onclick="_praOpen(\''+escHtml(String(hit.id))+'\')">Open it</a>'; }
  else if(bc.length>=6){ bst.className='pra-st ok'; bst.textContent='✓ Not in your list yet — no duplicate'; }
  else { bst.className='pra-st'; bst.textContent=''; }
  var same=nm?PR.all.find(function(p){ return _prN(p.name)===nm; }):null;
  if(same){ nst.className='pra-st warn'; nst.innerHTML='A product with this name exists ('+escHtml(same.category_name||'')+' · '+(Number(same.price)||0).toFixed(2)+' SAR) <a onclick="_praOpen(\''+escHtml(String(same.id))+'\')">Open it</a>'; }
  else { nst.className='pra-st'; nst.textContent=''; }
  return {dup:hit,same:same};
}
function _praPhoto(input){
  var f=input.files&&input.files[0]; input.value=''; if(!f)return;
  _pra.file=f; var pv=document.getElementById('pra-prev'), rd=new FileReader();
  rd.onload=function(e){ pv.src=e.target.result; pv.style.display='block'; }; rd.readAsDataURL(f);
}
async function prQuickSave(next){
  var err=document.getElementById('pra-err'); err.textContent='';
  var bc=document.getElementById('pra-bc').value.trim(), name=document.getElementById('pra-name').value.trim();
  var price=Number(String(document.getElementById('pra-price').value).replace(',','.')), cat=_praCat();
  var chk=_praCheck();
  if(chk.dup){ err.textContent='This barcode is already in your list — open it instead'; return; }
  if(!name){ err.textContent='Type the product name'; document.getElementById('pra-name').focus(); return; }
  if(!(price>0)){ err.textContent='Type a price more than 0'; document.getElementById('pra-price').focus(); return; }
  if(!cat){ err.textContent='Choose a category'; return; }
  var b1=document.getElementById('pra-next'), b2=document.getElementById('pra-done'); b1.disabled=b2.disabled=true; b1.textContent='Saving…';
  try{
    var img=null;
    if(_pra.file){ img=await uploadImg(_pra.file,'supermarket'); if(!img)throw new Error('Photo not uploaded — try again or save without photo'); }
    var r=await sb.from('supermarket_products').insert([{name:name,price:price,category_name:cat,barcode:bc||null,image_url:img,in_stock:true,is_active:true,sort_order:1}])
      .select('id,name,name_en,price,image_url,in_stock,category_name,barcode,sort_order,created_at').single();
    if(r.error)throw new Error(r.error.message);
    PR.all.unshift(_prPrep(r.data)); _prTwins(); prRender();
    PR.lastCat=cat; try{ localStorage.setItem('pr_last_cat',cat); }catch(e){}
    showToast('Added ✓ '+name);
    if(next){ _praReset(true); var t=document.getElementById(bc?'pra-bc':'pra-name'); if(t)t.focus(); }
    else prQuickClose();
  }catch(e){ err.textContent=(e&&e.message)||'Not saved — check the internet'; }
  b1.disabled=b2.disabled=false; b1.innerHTML='Save &amp; add next';
}

// ── Barcode camera: the phone's own reader when it has one, otherwise ZXing (loaded only when needed) ──
var _prs={target:'',stream:null,zx:null,raf:0};
function _prsBuild(){
  if(document.getElementById('prs-ov'))return;
  var ov=document.createElement('div'); ov.className='prs-ov'; ov.id='prs-ov';
  ov.innerHTML='<video id="prs-video" playsinline muted autoplay></video><div class="prs-frame"></div>'+
    '<div class="prs-hint" id="prs-hint">Point the camera at the barcode</div>'+
    '<button type="button" class="prs-x" onclick="prScanClose()" aria-label="Close"><i class="ti ti-x"></i></button>';
  document.body.appendChild(ov);
}
function _prsZX(){ return new Promise(function(ok,no){ if(window.ZXing)return ok();
  var sc=document.createElement('script'); sc.src='https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js'; sc.onload=function(){ ok(); }; sc.onerror=function(){ no(new Error('load')); }; document.head.appendChild(sc); }); }
async function prScan(target){
  _prsBuild(); _prs.target=target;
  var ov=document.getElementById('prs-ov'), v=document.getElementById('prs-video'), hint=document.getElementById('prs-hint');
  hint.textContent='Point the camera at the barcode'; ov.classList.add('show');
  try{
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('nocam');
    if('BarcodeDetector' in window){
      var det=new window.BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128','code_39','itf']});
      _prs.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});
      v.srcObject=_prs.stream; await v.play();
      var tick=function(){ if(!_prs.stream)return; det.detect(v).then(function(c){ if(c&&c.length)_prsDone(c[0].rawValue); else _prs.raf=requestAnimationFrame(tick); }).catch(function(){ _prs.raf=requestAnimationFrame(tick); }); };
      tick();
    }else{
      await _prsZX();
      _prs.zx=new window.ZXing.BrowserMultiFormatReader();
      await _prs.zx.decodeFromConstraints({video:{facingMode:'environment'}},v,function(res){ if(res)_prsDone(res.getText()); });
    }
  }catch(e){ hint.textContent='Camera not available — type the barcode instead'; setTimeout(prScanClose,1800); }
}
function prScanClose(){
  cancelAnimationFrame(_prs.raf);
  if(_prs.zx){ try{ _prs.zx.reset(); }catch(e){} _prs.zx=null; }
  if(_prs.stream){ _prs.stream.getTracks().forEach(function(t){ t.stop(); }); _prs.stream=null; }
  var v=document.getElementById('prs-video'); if(v)v.srcObject=null;
  var ov=document.getElementById('prs-ov'); if(ov)ov.classList.remove('show');
}
function _prsDone(code){
  code=String(code||'').trim(); if(!code)return;
  try{ navigator.vibrate&&navigator.vibrate(60); }catch(e){}
  prScanClose();
  if(_prs.target==='search'){ var q=document.getElementById('pr-q'); q.value=code; prSearch(code); }
  else { document.getElementById('pra-bc').value=code; _praCheck(); }
}

async function deleteSP(id,name){
  if(!confirm('Delete "'+name+'"?'))return;
  await sb.from('supermarket_products').delete().eq('id',id);
  PR.all=PR.all.filter(function(p){ return String(p.id)!==String(id); }); _prTwins(); prRender();
  showToast('Product deleted');
}

function goToProducts(catName){
  document.getElementById('products-cat-filter').value=catName;
  goSection('products');
  loadProductsByCategory(catName);
}

async function openAddSuperProduct(catName){
  currentSuperCat=catName;
  document.getElementById('modal-sproduct-title').textContent='Add product · '+catName;
  document.getElementById('sp-edit-id').value='';
  document.getElementById('sp-name').value='';
  document.getElementById('sp-price').value='';
  document.getElementById('sp-order').value='1';
  document.getElementById('sp-img-url').value='';
  document.getElementById('sp-stock').value='true';
  document.getElementById('sp-img-preview').style.display='none';
  document.getElementById('sp-img-ph').style.display='block';
  spImgFile=null;spImgUrl='';
  await loadSPCatSelect(catName);
  showModal('modal-sproduct');
}

async function openEditSP(id){
  const{data}=await sb.from('supermarket_products').select('*').eq('id',id).single();
  if(!data)return;
  document.getElementById('modal-sproduct-title').textContent='Edit product';
  document.getElementById('sp-edit-id').value=id;
  document.getElementById('sp-name').value=data.name||'';
  document.getElementById('sp-price').value=data.price||'';
  document.getElementById('sp-order').value=data.sort_order||1;
  document.getElementById('sp-img-url').value=data.image_url||'';
  document.getElementById('sp-stock').value=String(data.in_stock);
  spImgUrl=data.image_url||'';
  if(spImgUrl){document.getElementById('sp-img-preview').src=spImgUrl;document.getElementById('sp-img-preview').style.display='block';document.getElementById('sp-img-ph').style.display='none';}
  await loadSPCatSelect(data.category_name);
  showModal('modal-sproduct');
}

async function loadSPCatSelect(selected){
  const sel=document.getElementById('sp-cat');
  try{
    const{data}=await sb.from('supermarket_categories').select('name').eq('is_active',true).order('sort_order');
    sel.innerHTML=(data||[]).map(c=>'<option value="'+c.name+'"'+(c.name===selected?' selected':'')+'>'+c.name+'</option>').join('');
  }catch(e){sel.innerHTML='<option value="'+selected+'">'+selected+'</option>';}
}

function handleSPImg(input){
  const file=input.files[0];if(!file)return;
  spImgFile=file;
  document.getElementById('sp-img-url').value='';
  const r=new FileReader();
  r.onload=e=>{document.getElementById('sp-img-preview').src=e.target.result;document.getElementById('sp-img-preview').style.display='block';document.getElementById('sp-img-ph').style.display='none';};
  r.readAsDataURL(file);
}

async function saveSuperProduct(){
  const btn=document.getElementById('sproduct-save-btn');
  const err=document.getElementById('sproduct-err');
  const name=document.getElementById('sp-name').value.trim();
  const price=document.getElementById('sp-price').value;
  if(!name||!price){err.style.display='block';err.textContent='Name and price are required';return;}
  btn.innerHTML='<i class="ti ti-loader"></i> Saving...';btn.disabled=true;err.style.display='none';
  try{
    if(spImgFile){const url=await uploadImg(spImgFile,'supermarket');if(url)spImgUrl=url;}
    else if(document.getElementById('sp-img-url').value.trim())spImgUrl=document.getElementById('sp-img-url').value.trim();
    const payload={category_name:document.getElementById('sp-cat').value,name,price:Number(price),sort_order:Number(document.getElementById('sp-order').value)||1,in_stock:document.getElementById('sp-stock').value==='true',is_active:true,image_url:spImgUrl||null};
    const editId=document.getElementById('sp-edit-id').value;
    let supaErr;
    if(editId){const{error}=await sb.from('supermarket_products').update(payload).eq('id',editId);supaErr=error;}
    else{const{error}=await sb.from('supermarket_products').insert([payload]);supaErr=error;}
    if(supaErr)throw new Error(supaErr.message);
    btn.innerHTML='<i class="ti ti-check"></i> Save product';btn.disabled=false;
    showToast(editId?'Product updated ✓':'Product added ✓');
    closeModal('modal-sproduct');
    loadProductsByCategory(document.getElementById('products-cat-filter').value||'');
  }catch(e){err.style.display='block';err.textContent='Error: '+e.message;btn.innerHTML='<i class="ti ti-check"></i> Save product';btn.disabled=false;}
}
