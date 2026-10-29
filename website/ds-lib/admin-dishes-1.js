/* Delivery Step Admin → Dish options (modifier groups).
   Loaded by admin.html the first time one of these pages is opened (see _lazy in admin.html).
   Keep the file name versioned (admin-dishes-1.js, -2.js …): files in ds-lib are cached for a year. */
(function(){
  var S={"modifiers": "        <div class=\"section-header\">\n          <div class=\"section-title\">🎛️ Meal Modifiers</div>\n        </div>\n        <!-- Step 1: Select Vendor -->\n        <div class=\"card\" style=\"margin-bottom:12px\">\n          <div class=\"card-head\"><div class=\"card-title\">1. Select Vendor</div></div>\n          <div class=\"card-body\">\n            <select id=\"mod-rest-select\" onchange=\"loadModifierItems()\" style=\"width:100%;border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:13px;font-family:Inter,sans-serif;outline:none\">\n              <option value=\"\">-- Select a vendor --</option>\n            </select>\n          </div>\n        </div>\n        <!-- Step 2: Select Category -->\n        <div class=\"card\" style=\"margin-bottom:12px;display:none\" id=\"mod-cats-card\">\n          <div class=\"card-head\"><div class=\"card-title\">2. Select Category</div></div>\n          <div class=\"card-body\"><div id=\"mod-cats-list\" style=\"display:flex;flex-wrap:wrap;gap:8px\"></div></div>\n        </div>\n        <!-- Step 3: Select Product -->\n        <div class=\"card\" style=\"margin-bottom:12px;display:none\" id=\"mod-items-card\">\n          <div class=\"card-head\"><div class=\"card-title\">3. Select Product <span id=\"mod-cat-label\" style=\"color:var(--muted);font-weight:600;font-size:12px\"></span></div></div>\n          <div class=\"card-body\">\n            <div id=\"mod-items-list\" style=\"display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px\"></div>\n          </div>\n        </div>\n        <!-- Step 4: Manage Groups -->\n        <div class=\"card\" id=\"mod-groups-card\" style=\"display:none\">\n          <div class=\"card-head\">\n            <div class=\"card-title\">4. Modifier Groups for: <span id=\"mod-item-name\" style=\"color:var(--rose)\"></span></div>\n            <button class=\"btn-add\" onclick=\"openAddModGroup()\"><i class=\"ti ti-plus\" style=\"font-size:13px\"></i> Add Group</button>\n          </div>\n          <div class=\"card-body\" id=\"mod-groups-body\"></div>\n        </div>"};
  Object.keys(S).forEach(function(k){ var el=document.getElementById('section-'+k); if(el) el.innerHTML=S[k]; });
})();

// ══════════════════════════════════
// MODIFIERS
// ══════════════════════════════════
let modCurrentItemId=null,modCurrentItemName='';

async function loadModifierRestaurants(){
  const{data}=await sb.from('restaurants').select('id,name').order('name');
  const sel=document.getElementById('mod-rest-select');
  if(!sel)return;
  sel.innerHTML='<option value="">-- Select a restaurant --</option>'+(data||[]).map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
}

// Step 2: load the vendor's products, grouped into CATEGORY chips (not one long list)
var _modItems=[];
async function loadModifierItems(){
  const restId=document.getElementById('mod-rest-select').value;
  const catsCard=document.getElementById('mod-cats-card');
  const itemsCard=document.getElementById('mod-items-card');
  const groupsCard=document.getElementById('mod-groups-card');
  itemsCard.style.display='none';groupsCard.style.display='none';
  if(!restId){catsCard.style.display='none';return;}
  catsCard.style.display='block';
  document.getElementById('mod-cats-list').innerHTML='<div style="color:var(--muted);font-size:12px">Loading...</div>';
  const{data}=await sb.from('menu_items').select('id,name,price,category').eq('restaurant_id',restId).eq('is_active',true).order('category').order('sort_order');
  _modItems=data||[];
  const catsList=document.getElementById('mod-cats-list');
  if(!_modItems.length){catsList.innerHTML='<div style="color:var(--muted);font-size:12px">No products found for this vendor</div>';return;}
  const counts={},order=[];
  _modItems.forEach(function(it){var c=(it.category||'Uncategorized');if(!(c in counts)){counts[c]=0;order.push(c);}counts[c]++;});
  catsList.innerHTML=order.map(function(c){return '<button class="mod-cat-chip" onclick="selectModifierCategory(this,\''+String(c).replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\')">'+_modCatIcon(c)+' '+c+' <span class="c">'+counts[c]+'</span></button>';}).join('');
}
function _modCatIcon(c){
  c=String(c||'').toLowerCase();
  if(/drink|مشروب|عصير|صودا|كولا|بيبسي|جوس|juice/.test(c))return '🥤';
  if(/burger|برجر|برغر/.test(c))return '🍔';
  if(/pizza|بيتزا/.test(c))return '🍕';
  if(/broast|بروست|دجاج|chicken/.test(c))return '🍗';
  if(/dessert|حلو|كيك|cake|ice|آيس|ايس/.test(c))return '🍰';
  if(/side|جانب|بطاط|fries|مقبلات|مقبل/.test(c))return '🍟';
  if(/salad|سلط/.test(c))return '🥗';
  if(/sandwich|ساندو|شاورما|shawarma|wrap|راب|لفة/.test(c))return '🥙';
  if(/coffee|قهوة|كوفي|شاي|tea|كابتشينو|لاتيه/.test(c))return '☕';
  if(/rice|رز|أرز|كبسة|مندي|meal|وجب/.test(c))return '🍚';
  if(/breakfast|فطور|إفطار/.test(c))return '🍳';
  return '🍽️';
}
// Step 3: show only the chosen category's products
function selectModifierCategory(el,cat){
  document.querySelectorAll('#mod-cats-list .mod-cat-chip').forEach(function(b){b.classList.remove('on');});
  if(el)el.classList.add('on');
  const itemsCard=document.getElementById('mod-items-card');
  const groupsCard=document.getElementById('mod-groups-card');
  groupsCard.style.display='none';
  itemsCard.style.display='block';
  const lbl=document.getElementById('mod-cat-label');if(lbl)lbl.textContent='· showing “'+cat+'”';
  const items=_modItems.filter(function(it){return (it.category||'Uncategorized')===cat;});
  const list=document.getElementById('mod-items-list');
  if(!items.length){list.innerHTML='<div style="color:var(--muted);font-size:12px">No products in this category</div>';return;}
  list.innerHTML=items.map(item=>`
    <div onclick="selectModifierItem('${item.id}','${String(item.name||'').replace(/'/g,"\\'")}')" style="border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;cursor:pointer;transition:all .15s;background:#fff" onmouseover="this.style.borderColor='#be185d'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="font-size:12px;font-weight:600;color:var(--text)">${item.name}</div>
      <div style="font-size:11px;color:var(--muted);margin-top:2px">SAR ${item.price}</div>
    </div>`).join('');
}

async function selectModifierItem(itemId,itemName){
  modCurrentItemId=itemId;
  modCurrentItemName=itemName;
  document.getElementById('mod-item-name').textContent=itemName;
  document.getElementById('mod-groups-card').style.display='block';
  await loadModifierGroups();
}

async function loadModifierGroups(){
  const body=document.getElementById('mod-groups-body');
  body.innerHTML='<div style="color:var(--muted);font-size:12px">Loading...</div>';
  const{data:groups}=await sb.from('modifier_groups').select('*').eq('menu_item_id',modCurrentItemId).order('sort_order');
  if(!groups||!groups.length){body.innerHTML='<div style="color:var(--muted);font-size:12px;text-align:center;padding:16px">No modifier groups yet. Click "Add Group" to start.</div>';return;}
  let html='';
  for(const g of groups){
    const{data:opts}=await sb.from('modifier_options').select('*').eq('group_id',g.id).order('sort_order');
    html+=`<div style="border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div>
          <span style="font-size:13px;font-weight:600">${g.name}</span>
          <span style="font-size:10px;padding:2px 8px;border-radius:20px;margin-right:6px;${g.required?'background:#fee2e2;color:#dc2626':'background:#f0fdf4;color:#16a34a'}">${g.required?'مطلوب':'اختياري'}</span>
          <span style="font-size:10px;color:var(--muted)">${g.type==='radio'?'اختيار واحد':'متعدد'}</span>
        </div>
        <div style="display:flex;gap:6px">
          <button onclick="openAddModOption('${g.id}')" style="border:1px solid var(--rose);color:var(--rose);background:none;border-radius:7px;padding:4px 10px;font-size:11px;cursor:pointer;font-family:Inter,sans-serif"><i class="ti ti-plus" style="font-size:11px"></i> Add Option</button>
          <button onclick="deleteModGroup('${g.id}')" style="border:1px solid var(--border);color:var(--muted);background:none;border-radius:7px;padding:4px 8px;font-size:11px;cursor:pointer"><i class="ti ti-trash" style="font-size:12px"></i></button>
        </div>
      </div>
      <div id="opts-${g.id}">
        ${(opts||[]).map(o=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--bg);border-radius:7px;margin-bottom:5px;font-size:12px">
          <span>${o.name}</span>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="color:var(--rose);font-weight:600">${o.extra_price>0?'+SAR '+o.extra_price:'مجاني'}</span>
            <button onclick="deleteModOption('${o.id}','${g.id}')" style="border:none;background:none;cursor:pointer;color:var(--muted)"><i class="ti ti-x" style="font-size:12px"></i></button>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  }
  body.innerHTML=html;
}

function openAddModGroup(){
  const name=prompt('Group name (e.g. اختر المشروب):');
  if(!name)return;
  const required=confirm('Is this group required? (OK = Yes, Cancel = Optional)');
  const type=confirm('Single choice only? (OK = Radio/One, Cancel = Checkbox/Multiple)')? 'radio':'checkbox';
  saveModGroup(name,required,type);
}

async function saveModGroup(name,required,type){
  const{error}=await sb.from('modifier_groups').insert({menu_item_id:modCurrentItemId,name,required,type});
  if(error){showToast('Error: '+error.message);return;}
  showToast('Group added ✓');
  loadModifierGroups();
}

function openAddModOption(groupId){
  const name=prompt('Option name (e.g. بيبسي):');
  if(!name)return;
  const priceStr=prompt('Extra price (0 for free):','0');
  const price=parseFloat(priceStr)||0;
  saveModOption(groupId,name,price);
}

async function saveModOption(groupId,name,price){
  const{error}=await sb.from('modifier_options').insert({group_id:groupId,name,extra_price:price});
  if(error){showToast('Error: '+error.message);return;}
  showToast('Option added ✓');
  loadModifierGroups();
}

async function deleteModGroup(groupId){
  if(!confirm('Delete this group and all its options?'))return;
  await sb.from('modifier_groups').delete().eq('id',groupId);
  showToast('Group deleted');
  loadModifierGroups();
}

async function deleteModOption(optId,groupId){
  await sb.from('modifier_options').delete().eq('id',optId);
  showToast('Option deleted');
  loadModifierGroups();
}
