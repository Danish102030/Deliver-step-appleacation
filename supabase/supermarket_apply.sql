-- Supermarket re-sort: APPLY (approved 2026-10-22). One transaction.
-- Backup first: ds_work.sm_bak_cat_20261022 / ds_work.sm_bak_prod_20261022 (undo = copy those back).

create table if not exists ds_work.sm_bak_cat_20261022 as select * from public.supermarket_categories;
create table if not exists ds_work.sm_bak_prod_20261022 as select id, category_name, is_active from public.supermarket_products;

-- freeze the proposal (its rules read the OLD category names)
create table if not exists ds_work.sm_final as
  select id, case when aisle = 'مشروبات' then 'المشروبات' else aisle end as aisle, sub, collections
  from ds_work.sm_proposal_coll where aisle is not null and aisle <> 'مراجعة';

alter table public.supermarket_products add column if not exists collections text[] not null default '{}';

-- 1) old top-level categories become the 18 sections (same row → same picture and same /category/<slug> link)
create table ds_work.sm_aisle(old text, new text, ord int, slug text, emoji text);
insert into ds_work.sm_aisle values
('فواكه وخضروات','فواكه وخضار',1,null,'🍎'),('منتجات الألبان والبيض','ألبان وبيض',2,null,'🥛'),('المخبوزات','مخبوزات',3,null,'🍞'),
(null,'مربى وحبوب الإفطار',4,'breakfast-spreads','🍯'),('ايسكريمات','آيسكريم',5,null,'🍦'),('Chocolate شوكولاتة','شوكولاتة وحلويات',6,null,'🍫'),
('الشيبس والوجبات الخفيفة','شيبس وسناكس',7,null,'🥔'),('Beverages المشروبات','المشروبات',8,null,'🥤'),('عصائر وحلويات طازجة','عصائر وحلويات طازجة',9,null,'🧃'),
('الأطعمة المجمدة','مجمدات',10,null,'🧊'),('مستلزمات الطبخ','زيوت ومستلزمات الطبخ',11,null,'🫒'),('أرز ومعكرونة','رز ومعكرونة',12,null,'🍚'),
('المعلبات','معلبات',13,null,'🥫'),('القهوة والشاي','قهوة وشاي',14,null,'☕'),('مكسرات بذور و فواكه مجففة','مكسرات وتمور',15,null,'🥜'),
('مستلزمات الطفل','مستلزمات الطفل',16,null,'👶'),('الصحة والجمال','العناية والتنظيف',17,null,'🧴'),('أدوات المطبخ','مستلزمات البيت',18,null,'🍽️');

update public.supermarket_categories c set parent_name = a.new
  from ds_work.sm_aisle a where c.parent_name = a.old and a.old is not null and a.old <> a.new and c.is_active;
update public.supermarket_categories c set name = a.new, sort_order = a.ord, is_active = true
  from ds_work.sm_aisle a where c.name = a.old and c.parent_name is null and c.is_active;

-- 2) brand / tiny shelves retire (hidden; old links open the section they moved to)
update public.supermarket_categories set is_active = false, parent_name = 'ألبان وبيض' where name = 'الصافي' and parent_name is null;
update public.supermarket_categories set is_active = false, parent_name = 'شوكولاتة وحلويات' where name = 'جالكسي' and parent_name is null;
update public.supermarket_categories set is_active = false, parent_name = 'مستلزمات البيت' where name = 'ركن الكشتات مقطع' and parent_name is null;

-- 3) existing shelves that become sub-sections
update public.supermarket_categories set parent_name = 'زيوت ومستلزمات الطبخ' where name in ('بهارات','صلصات الطهي') and parent_name is null and is_active;
update public.supermarket_categories set parent_name = 'العناية والتنظيف' where name = 'التنظيف والغسيل' and parent_name is null and is_active;

-- 4) the sub-sections (insert the new ones, order all of them)
create table ds_work.sm_sub(aisle text, name text, ord int, slug text);
insert into ds_work.sm_sub values
('فواكه وخضار','خضار',1,'vegetables'),('فواكه وخضار','فواكه',2,'fruits'),('فواكه وخضار','ورقيات وأعشاب',3,'leafy-herbs'),
('ألبان وبيض','حليب',1,'milk'),('ألبان وبيض','لبن وزبادي',2,'laban-yogurt'),('ألبان وبيض','أجبان',3,'cheese'),('ألبان وبيض','قشطة ولبنة',4,'cream-labneh'),
('ألبان وبيض','بيض',5,'eggs'),('ألبان وبيض','زبدة',6,'butter'),('ألبان وبيض','حليب بالنكهات',7,'flavoured-milk'),('ألبان وبيض','حليب بودرة ومبخر',8,'powdered-milk'),('ألبان وبيض','حلا الألبان',9,'dairy-desserts'),
('مخبوزات','خبز وتورتيلا',1,'bread'),('مخبوزات','كيك وكرواسون ومعجنات',2,'cakes-croissants'),('مخبوزات','معمول وشابورة',3,'maamoul-rusk'),
('مربى وحبوب الإفطار','مربى وعسل',1,'jam-honey'),('مربى وحبوب الإفطار','حلاوة وطحينة',2,'halawa-tahini'),('مربى وحبوب الإفطار','كريمات للدهن',3,'spreads'),('مربى وحبوب الإفطار','حبوب الإفطار والشوفان',4,'cereals'),
('شوكولاتة وحلويات','شوكولاتة',1,'chocolate-bars'),('شوكولاتة وحلويات','بسكويت وويفر',2,'biscuits-wafers'),('شوكولاتة وحلويات','حلوى وعلك وجيلي',3,'candy-gum'),
('شيبس وسناكس','شيبس بطاطس',1,'potato-chips'),('شيبس وسناكس','سناكس وقراقيش',2,'corn-snacks'),('شيبس وسناكس','فشار',3,'popcorn'),
('المشروبات','العصائر',1,null),('المشروبات','مشروب غازي',2,null),('المشروبات','مياه وثلج',3,null),('المشروبات','مشروبات الطاقة',4,'energy-drinks'),('المشروبات','مشروبات الشعير',5,'malt-drinks'),
('عصائر وحلويات طازجة','العصائر الطازجة',0,'fresh-juices'),
('مجمدات','دجاج ولحوم مجمدة',1,'frozen-chicken-meat'),('مجمدات','برجر وستربس ومصنعات',2,'burgers-strips'),('مجمدات','بطاطس مقلية',3,'fries'),('مجمدات','خضار وفواكه مجمدة',4,'frozen-vegetables'),('مجمدات','عجائن مجمدة',5,'frozen-dough'),
('زيوت ومستلزمات الطبخ','زيوت وسمن',1,'oils-ghee'),('زيوت ومستلزمات الطبخ','بهارات',2,null),('زيوت ومستلزمات الطبخ','صلصات الطهي',3,null),('زيوت ومستلزمات الطبخ','معجون وصلصة الطماطم',4,'tomato-paste'),
('زيوت ومستلزمات الطبخ','ملح وسكر',5,'salt-sugar'),('زيوت ومستلزمات الطبخ','دقيق ومستلزمات الحلويات',6,'flour-baking'),('زيوت ومستلزمات الطبخ','مرق وشوربة',7,'stock-soup'),
('رز ومعكرونة','رز',1,'rice'),('رز ومعكرونة','معكرونة',2,'pasta'),('رز ومعكرونة','شعيرية وإندومي',3,'noodles'),
('معلبات','فول وحمص وفاصوليا',1,'foul-hummus'),('معلبات','تونة ولحوم معلبة',2,'tuna'),('معلبات','زيتون ومخللات',3,'olives-pickles'),('معلبات','خضار وفواكه معلبة',4,'canned-vegetables'),
('قهوة وشاي','شاي وأعشاب',1,'tea'),('قهوة وشاي','قهوة عربية وهيل',2,'arabic-coffee'),('قهوة وشاي','نسكافيه وكاكاو',3,'instant-coffee'),
('مكسرات وتمور','مكسرات',1,'nuts'),('مكسرات وتمور','بذور وحب',2,'seeds'),('مكسرات وتمور','تمور وفواكه مجففة',3,'dates-dried-fruit'),
('مستلزمات الطفل','حفاضات',1,'diapers'),('مستلزمات الطفل','رضاعة ومناديل',2,'baby-care-items'),('مستلزمات الطفل','حليب الأطفال',3,'baby-milk'),
('العناية والتنظيف','العناية بالجسم والشعر',1,'body-hair-care'),('العناية والتنظيف','العناية بالأسنان',2,'oral-care'),('العناية والتنظيف','التنظيف والغسيل',3,null),
('مستلزمات البيت','أكياس ونفايات',1,'bags'),('مستلزمات البيت','أكواب وصحون وملاعق',2,'cups-plates'),('مستلزمات البيت','ورق قصدير وتغليف',3,'foil-wrap'),
('مستلزمات البيت','رحلات وتبريد',4,'camping-cooling'),('مستلزمات البيت','أدوات متنوعة',5,'home-tools');

-- picture for a new section/sub-section = photo of its best-selling product
create table ds_work.sm_pic as
with sold as (select split_part(oi.product_name, E'\n', 1) n, sum(oi.quantity) q
              from public.order_items oi join public.orders o on o.id = oi.order_id
              where o.created_at > now() - interval '120 days' and o.order_status = 'delivered' group by 1)
select f.sub, f.aisle, p.image_url, row_number() over (partition by f.sub order by coalesce(s.q,0) desc, p.name) rn
from ds_work.sm_final f join public.supermarket_products p on p.id = f.id left join sold s on s.n = p.name
where coalesce(p.image_url,'') <> '';

-- the new section «مربى وحبوب الإفطار»
insert into public.supermarket_categories(name, parent_name, slug, sort_order, is_active, image_url, bg_color)
select 'مربى وحبوب الإفطار', null, 'breakfast-spreads', 4, true,
       (select image_url from ds_work.sm_pic where aisle = 'مربى وحبوب الإفطار' order by rn limit 1), '#fffbeb'
where not exists (select 1 from public.supermarket_categories where name = 'مربى وحبوب الإفطار' and parent_name is null);

insert into public.supermarket_categories(name, parent_name, slug, sort_order, is_active, image_url, bg_color)
select s.name, s.aisle, s.slug, s.ord, true,
       (select image_url from ds_work.sm_pic p2 where p2.sub = s.name and rn = 1),
       (select bg_color from public.supermarket_categories pc where pc.name = s.aisle and pc.parent_name is null and pc.is_active limit 1)
from ds_work.sm_sub s
where not exists (select 1 from public.supermarket_categories c where c.name = s.name and c.parent_name = s.aisle and c.is_active);

update public.supermarket_categories c set sort_order = s.ord from ds_work.sm_sub s where c.name = s.name and c.parent_name = s.aisle and c.is_active;

-- 5) products → their sub-section (ice cream has no sub-sections) + collections
update public.supermarket_products p
   set category_name = case when f.aisle = 'آيسكريم' then 'آيسكريم' else f.sub end,
       collections = f.collections
  from ds_work.sm_final f
 where f.id = p.id and (p.category_name is distinct from case when f.aisle = 'آيسكريم' then 'آيسكريم' else f.sub end
                        or p.collections is distinct from f.collections);

-- 6) the test product is hidden from customers
update public.supermarket_products set is_active = false where name = 'Test' and category_name = 'المعلبات';

-- Step 2 (live): public.sm_home() — one call for the supermarket front page (sections + counts, collections, most ordered);
-- slugs breakfast/lunch/dinner/sweets/kashta/cold are reserved for the collection pages (/category/<key>).
