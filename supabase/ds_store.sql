-- ═══ Delivery Step Store (متجر خطوة التوصيل) — the owner's own shop ═══
-- The store is ONE row in restaurants (category 'ds_store') so cart, checkout, orders, riders and
-- notifications work exactly as for any shop. Its products are normal menu_items.
-- Extra, owner-only data (buying cost, stock count) lives in ds_store_items (never readable by customers).
-- Every store line of every order is copied into ds_store_sales (with the cost at that moment) for profit reports.

create table if not exists public.ds_store_departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  color text,
  kind text not null default 'normal' check (kind in ('normal','recharge')),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.ds_store_departments enable row level security;
do $do$ begin
  if not exists (select 1 from pg_policies where tablename='ds_store_departments' and policyname='public read active') then
    create policy "public read active" on public.ds_store_departments for select to anon, authenticated using (is_active);
  end if;
  if not exists (select 1 from pg_policies where tablename='ds_store_departments' and policyname='admin full access') then
    create policy "admin full access" on public.ds_store_departments for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
  end if;
end $do$;

create table if not exists public.ds_store_items (
  item_id uuid primary key references public.menu_items(id) on delete cascade,
  cost numeric(10,2) check (cost is null or cost >= 0),   -- what the owner pays (secret)
  stock int,                                               -- pieces on the shelf; null = not counted
  low_at int not null default 3,                           -- "low stock" warning level
  updated_at timestamptz not null default now()
);
alter table public.ds_store_items enable row level security;
do $do$ begin
  if not exists (select 1 from pg_policies where tablename='ds_store_items' and policyname='admin full access') then
    create policy "admin full access" on public.ds_store_items for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
  end if;
end $do$;

create table if not exists public.ds_store_sales (
  id bigserial primary key,
  order_id uuid not null,
  order_item_id uuid unique,
  item_id uuid,
  item_name text,
  department text,
  qty int not null,
  unit_price numeric(10,2) not null,
  unit_cost numeric(10,2),                 -- cost when it was sold (null = cost not entered yet)
  stock_taken boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists ds_store_sales_order_idx on public.ds_store_sales(order_id);
create index if not exists ds_store_sales_created_idx on public.ds_store_sales(created_at);
alter table public.ds_store_sales enable row level security;
do $do$ begin
  if not exists (select 1 from pg_policies where tablename='ds_store_sales' and policyname='admin read') then
    create policy "admin read" on public.ds_store_sales for select to authenticated using ((select public.is_admin()));
  end if;
end $do$;

-- the store's restaurants row (null until the owner presses "Set up my store")
create or replace function public.ds_store_vendor_id()
returns uuid language sql stable security definer set search_path to '' as $$
  select id from public.restaurants where category = 'ds_store' order by created_at limit 1
$$;
grant execute on function public.ds_store_vendor_id() to anon, authenticated;

-- stock count → "sold out" switch for customers (only flips it when the count crosses 0)
create or replace function public._ds_store_stock_sync()
returns trigger language plpgsql security definer set search_path to '' as $$
begin
  if new.stock is null then return new; end if;
  if new.stock <= 0 and (tg_op = 'INSERT' or old.stock is null or old.stock > 0) then
    update public.menu_items set in_stock = false where id = new.item_id and in_stock is distinct from false;
  elsif new.stock > 0 and (tg_op = 'INSERT' or old.stock is null or old.stock <= 0) then
    update public.menu_items set in_stock = true where id = new.item_id and in_stock is distinct from true;
  end if;
  return new;
end $$;
drop trigger if exists trg_ds_store_stock_sync on public.ds_store_items;
create trigger trg_ds_store_stock_sync after insert or update of stock on public.ds_store_items
  for each row execute function public._ds_store_stock_sync();

-- every order line of the store → sales log + take it from the stock. NEVER blocks an order.
create or replace function public._ds_store_on_order_item()
returns trigger language plpgsql security definer set search_path to '' as $$
declare v_vid uuid; v_vname text; v_base text; v_item uuid; v_dep text; v_cost numeric; v_stock int; v_qty int;
begin
  begin
    if new.vendor_name is null or new.order_id is null then return new; end if;
    select id, name into v_vid, v_vname from public.restaurants where category = 'ds_store' order by created_at limit 1;
    if v_vid is null or new.vendor_name is distinct from v_vname then return new; end if;
    v_base := btrim(split_part(coalesce(new.product_name, ''), E'\n', 1));
    v_qty  := greatest(coalesce(new.quantity, 1), 1);
    -- the cart may add the phone model after the name: "حماية شاشة زجاج (iPhone 16)"
    select m.id, m.category into v_item, v_dep from public.menu_items m
     where m.restaurant_id = v_vid and (m.name = v_base or left(v_base, length(m.name) + 2) = m.name || ' (')
     order by length(m.name) desc limit 1;
    if v_item is not null then
      select cost, stock into v_cost, v_stock from public.ds_store_items where item_id = v_item;
    end if;
    insert into public.ds_store_sales(order_id, order_item_id, item_id, item_name, department, qty, unit_price, unit_cost, stock_taken)
    values (new.order_id, new.id, v_item, v_base, v_dep, v_qty, coalesce(new.unit_price, 0), v_cost, v_stock is not null)
    on conflict (order_item_id) do nothing;
    if found and v_stock is not null then
      update public.ds_store_items set stock = stock - v_qty, updated_at = now() where item_id = v_item;
    end if;
  exception when others then
    null;   -- a report problem must never lose a customer's order
  end;
  return new;
end $$;
drop trigger if exists trg_ds_store_on_order_item on public.order_items;
create trigger trg_ds_store_on_order_item after insert on public.order_items
  for each row execute function public._ds_store_on_order_item();

-- order cancelled / deleted → put the pieces back on the shelf (and take them again if it is restored)
create or replace function public._ds_store_on_order_change()
returns trigger language plpgsql security definer set search_path to '' as $$
declare was_off boolean; is_off boolean; r record;
begin
  begin
    was_off := coalesce(old.order_status, '') ~* '^cancel' or old.deleted_at is not null;
    is_off  := coalesce(new.order_status, '') ~* '^cancel' or new.deleted_at is not null;
    if was_off = is_off then return new; end if;
    if not exists (select 1 from public.ds_store_sales where order_id = new.id) then return new; end if;
    if is_off then
      for r in select id, item_id, qty from public.ds_store_sales where order_id = new.id and stock_taken loop
        update public.ds_store_items set stock = stock + r.qty, updated_at = now() where item_id = r.item_id and stock is not null;
        update public.ds_store_sales set stock_taken = false where id = r.id;
      end loop;
    else
      for r in select s.id, s.item_id, s.qty from public.ds_store_sales s join public.ds_store_items i on i.item_id = s.item_id
                where s.order_id = new.id and not s.stock_taken and i.stock is not null loop
        update public.ds_store_items set stock = stock - r.qty, updated_at = now() where item_id = r.item_id;
        update public.ds_store_sales set stock_taken = true where id = r.id;
      end loop;
    end if;
  exception when others then
    null;
  end;
  return new;
end $$;
drop trigger if exists trg_ds_store_on_order_change on public.orders;
create trigger trg_ds_store_on_order_change after update of order_status, deleted_at on public.orders
  for each row execute function public._ds_store_on_order_change();

-- Admin: create the store (once, HIDDEN and closed) + the starting departments. Returns the store id.
create or replace function public.ds_store_setup(p_name text default 'متجر خطوة التوصيل', p_fee numeric default 7, p_whatsapp text default '')
returns uuid language plpgsql volatile security definer set search_path to '' as $$
declare v uuid;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  v := public.ds_store_vendor_id();
  if v is null then
    insert into public.restaurants(name, category, whatsapp, delivery_fee, delivery_time, rating, is_open, is_active, sort_order, open_time, close_time, is_24h, min_order, description)
    values (coalesce(nullif(btrim(p_name), ''), 'متجر خطوة التوصيل'), 'ds_store', coalesce(btrim(p_whatsapp), ''), greatest(coalesce(p_fee, 7), 0), '20-30', 5, false, false, 9999, '08:00', '02:00', false, 0,
            'شحن رصيد وإكسسوارات جوال')
    returning id into v;
  end if;
  if not exists (select 1 from public.ds_store_departments) then
    insert into public.ds_store_departments(name, icon, color, kind, sort_order) values
      ('شحن رصيد', '📶', '#f5f3ff', 'recharge', 1),
      ('شواحن وكيابل', '🔌', '#ecfeff', 'normal', 2),
      ('سماعات', '🎧', '#fdf2f8', 'normal', 3),
      ('كفرات وحماية', '📱', '#f0fdf4', 'normal', 4);
  end if;
  return v;
end $$;
grant execute on function public.ds_store_setup(text, numeric, text) to authenticated;

-- Admin: rename a department and move its products with it
create or replace function public.ds_store_rename_department(p_id uuid, p_name text)
returns void language plpgsql volatile security definer set search_path to '' as $$
declare v_old text; v_new text := btrim(coalesce(p_name, '')); v_vid uuid := public.ds_store_vendor_id();
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if v_new = '' then raise exception 'empty name'; end if;
  select name into v_old from public.ds_store_departments where id = p_id;
  if v_old is null then raise exception 'not found'; end if;
  if v_old = v_new then return; end if;
  update public.ds_store_departments set name = v_new where id = p_id;
  update public.menu_items set category = v_new where restaurant_id = v_vid and category = v_old;
  update public.ds_store_sales set department = v_new where department = v_old;
end $$;
grant execute on function public.ds_store_rename_department(uuid, text) to authenticated;

-- Customers: the store's best sellers (item ids only — no money data)
create or replace function public.ds_store_best(p_limit int default 8)
returns jsonb language sql stable security definer set search_path to '' as $$
  select coalesce(jsonb_agg(item_id order by n desc), '[]'::jsonb) from (
    select s.item_id, sum(s.qty) n from public.ds_store_sales s join public.orders o on o.id = s.order_id
     where s.item_id is not null and s.created_at >= now() - interval '30 days'
       and o.deleted_at is null and coalesce(o.order_status, '') !~* '^cancel'
     group by s.item_id order by n desc limit greatest(least(coalesce(p_limit, 8), 20), 1)) x
$$;
grant execute on function public.ds_store_best(int) to anon, authenticated;

-- Admin → My store: everything the reports need, for the last p_days (1 = today, Riyadh time)
create or replace function public.admin_ds_store_stats(p_days int default 7)
returns jsonb language plpgsql stable security definer set search_path to '' as $$
declare tz constant text := 'Asia/Riyadh'; d_to date := (now() at time zone tz)::date; d_from date; n int;
        t_from timestamptz; t_prev timestamptz; r jsonb;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  n := greatest(least(coalesce(p_days, 7), 365), 1);
  d_from := d_to - (n - 1);
  t_from := d_from::timestamp at time zone tz;
  t_prev := (d_from - n)::timestamp at time zone tz;
  with live as (      -- store lines of real orders (not cancelled / deleted), last 2 periods + 30 days
    select s.*, o.order_number, o.order_status, o.customer_name, public.ds_phone9(o.customer_phone) p9, o.created_at o_at
      from public.ds_store_sales s join public.orders o on o.id = s.order_id
     where o.deleted_at is null and coalesce(o.order_status, '') !~* '^cancel'
       and o.created_at >= least(t_prev, now() - interval '30 days')),
  cur as (select * from live where o_at >= t_from),
  prev as (select * from live where o_at >= t_prev and o_at < t_from),
  first_buy as (select public.ds_phone9(o.customer_phone) p9, min(o.created_at) f from public.ds_store_sales s join public.orders o on o.id = s.order_id
                 where o.deleted_at is null and coalesce(o.order_status, '') !~* '^cancel' group by 1),
  cust as (select p9, count(distinct order_id) n from cur where p9 is not null group by p9)
  select jsonb_build_object(
    'from', d_from, 'to', d_to, 'days', n,
    'store_id', public.ds_store_vendor_id(),
    'sales', (select coalesce(round(sum(qty * unit_price), 2), 0) from cur),
    'profit', (select coalesce(round(sum(qty * (unit_price - unit_cost)), 2), 0) from cur where unit_cost is not null),
    'sales_no_cost', (select coalesce(round(sum(qty * unit_price), 2), 0) from cur where unit_cost is null),
    'orders', (select count(distinct order_id) from cur),
    'prev_sales', (select coalesce(round(sum(qty * unit_price), 2), 0) from prev),
    'prev_orders', (select count(distinct order_id) from prev),
    'customers', (select count(*) from cust),
    'new_customers', (select count(*) from cust c join first_buy f using (p9) where f.f >= t_from),
    'came_back', (select count(*) from cust c join first_buy f using (p9) where f.f < t_from or c.n >= 2),
    'by_day', (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'sales', coalesce(x.s, 0), 'profit', coalesce(x.p, 0), 'orders', coalesce(x.o, 0)) order by d), '[]'::jsonb)
                 from generate_series(d_from, d_to, interval '1 day') g(d)
                 left join (select (o_at at time zone tz)::date dd, round(sum(qty * unit_price), 2) s,
                                   round(sum(case when unit_cost is not null then qty * (unit_price - unit_cost) end), 2) p, count(distinct order_id) o
                              from cur group by 1) x on x.dd = g.d::date),
    'by_dep', (select coalesce(jsonb_agg(x order by x.sales desc), '[]'::jsonb) from (
                 select coalesce(department, 'أخرى') dep, round(sum(qty * unit_price), 2) sales,
                        round(coalesce(sum(case when unit_cost is not null then qty * (unit_price - unit_cost) end), 0), 2) profit, sum(qty) qty
                   from cur group by 1) x),
    'items', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
                 select item_id, coalesce((select m.name from public.menu_items m where m.id = cur.item_id), max(item_name)) name, sum(qty) qty, round(sum(qty * unit_price), 2) sales,
                        round(coalesce(sum(case when unit_cost is not null then qty * (unit_price - unit_cost) end), 0), 2) profit
                   from cur group by item_id) x),
    'speed', (select coalesce(jsonb_object_agg(item_id, q), '{}'::jsonb) from (
                 select item_id, sum(qty) q from live where item_id is not null and o_at >= now() - interval '30 days' group by item_id) x),
    'last_sold', (select coalesce(jsonb_object_agg(item_id, t), '{}'::jsonb) from (
                 select item_id, max(o_at) t from live where item_id is not null group by item_id) x),
    'hours', (select coalesce(jsonb_object_agg(h, c), '{}'::jsonb) from (
                 select extract(hour from o_at at time zone tz)::int h, count(distinct order_id) c from cur group by 1) x),
    'orders_list', (select coalesce(jsonb_agg(x order by x.at desc), '[]'::jsonb) from (
                 select order_id, max(order_number) num, max(o_at) at, max(order_status) status,
                        split_part(btrim(coalesce(max(customer_name), '')), ' ', 1) customer,
                        jsonb_agg(jsonb_build_object('name', item_name, 'qty', qty, 'price', unit_price) order by id) lines,
                        round(sum(qty * unit_price), 2) total,
                        round(sum(case when unit_cost is not null then qty * (unit_price - unit_cost) end), 2) profit
                   from cur group by order_id order by max(o_at) desc limit 60) x)
  ) into r;
  return r;
end $$;
grant execute on function public.admin_ds_store_stats(int) to authenticated;

-- 2026-10-26: the card-photo service fee is its own order line («رسوم الخدمة …») → logged as income with no cost.
-- (public._ds_store_on_order_item: if the line starts with 'رسوم الخدمة' → department 'رسوم الخدمة', unit_cost 0, no stock.)
