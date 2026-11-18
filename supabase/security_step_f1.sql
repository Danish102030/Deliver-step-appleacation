-- Security step F1 (owner approved 18 Nov 2026): customer account protection WITHOUT login codes.
-- 1) Lookup limit: one internet address (x-forwarded-for) may look up at most 30 different phone numbers
--    (or phone + order-number pairs) per hour in my_orders, track_order, customer_cancel_info/_order,
--    save_my_profile and the delete request. Real customers use 1–2 (checked in the logs: the busiest address
--    made ~100 calls in an hour, almost all for one phone). No address known (SQL editor, server) → never blocked.
-- 2) track_order: home address + map point only while the order is active (not delivered / cancelled, < 24 h).
-- 3) "Delete my account" becomes a REQUEST. The owner approves it in Admin (Dashboard card) → the old deletion
--    (now public._ds_delete_account_now, not callable by the app) runs. Old app copies still get ok:true.
-- Undo: security_step_f1_rollback.sql
create table if not exists ds_work.phone_lookups (
  ip text not null, k text not null, hr timestamptz not null,
  primary key (ip, k)
);
create index if not exists phone_lookups_ip_hr on ds_work.phone_lookups (ip, hr);
alter table ds_work.phone_lookups enable row level security;

create table if not exists ds_work.account_deletion_requests (
  id bigserial primary key,
  phone9 text not null,
  ip text,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  decided_at timestamptz,
  decided_by uuid,
  result jsonb
);
create unique index if not exists account_deletion_one_pending on ds_work.account_deletion_requests (phone9) where status = 'pending';
alter table ds_work.account_deletion_requests enable row level security;

create or replace function public._ds_client_ip() returns text
language sql stable set search_path = '' as $f$
  select nullif(btrim(split_part(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1)), '')
$f$;

-- true = go ahead; false = this address looked up too many different numbers this hour
create or replace function public._ds_lookup_ok(p_key text) returns boolean
language plpgsql security definer set search_path = '' as $f$
declare v_ip text := public._ds_client_ip(); v_hr timestamptz := date_trunc('hour', now()); n int;
begin
  if v_ip is null or coalesce(p_key, '') = '' then return true; end if;
  insert into ds_work.phone_lookups (ip, k, hr) values (v_ip, left(p_key, 80), v_hr)
    on conflict (ip, k) do update set hr = excluded.hr;
  select count(*) into n from ds_work.phone_lookups l where l.ip = v_ip and l.hr = v_hr;
  return n <= 30;
end $f$;
revoke execute on function public._ds_lookup_ok(text) from public, anon, authenticated;

create or replace function public.my_orders(p_phone text)
 returns jsonb language plpgsql volatile security definer set search_path to 'public', 'pg_temp'
as $f$
declare p9 text := public.ds_phone9(p_phone);
begin
  if length(p9) < 9 then return '[]'::jsonb; end if;
  if not public._ds_lookup_ok(p9) then return '[]'::jsonb; end if;   -- F1 lookup limit
  return coalesce((
    select jsonb_agg(x order by x.created_at desc) from (
      select o.id, o.created_at, o.order_number, o.order_status, o.vendor_name, o.subtotal, o.delivery_fee, o.total,
             coalesce((select jsonb_agg(jsonb_build_object('product_name', i.product_name, 'quantity', i.quantity, 'unit_price', i.unit_price, 'vendor_name', i.vendor_name) order by i.created_at, i.id)
                         from public.order_items i where i.order_id = o.id), '[]'::jsonb) as items
        from public.orders o
       where public.ds_phone9(o.customer_phone) = p9 and o.deleted_at is null
       order by o.created_at desc limit 100) x), '[]'::jsonb);
end $f$;

create or replace function public.track_order(p_order_number text, p_phone text)
 returns jsonb language plpgsql volatile security definer set search_path to 'public', 'pg_temp'
as $f$
declare
  p9 text := public.ds_phone9(p_phone);
  o public.orders%rowtype;
  r_lat numeric; r_lng numeric; r_at timestamptz; r_name text;
  live boolean;
begin
  if length(p9) < 9 or coalesce(btrim(p_order_number), '') = '' then return null; end if;
  if not public._ds_lookup_ok(p9 || '#' || btrim(p_order_number)) then return null; end if;   -- F1 lookup limit
  select * into o from public.orders
   where order_number = btrim(p_order_number) and deleted_at is null and public.ds_phone9(customer_phone) = p9
   order by created_at desc limit 1;
  if not found then return null; end if;
  -- F1: the home address / map point only while the order is on its way (not delivered / cancelled, < 24 h)
  live := coalesce(o.order_status, '') not in ('delivered', 'cancelled') and coalesce(o.order_status, '') !~* '^cancel'
          and o.created_at > now() - interval '24 hours';
  if o.rider_id is not null and o.order_status = 'on_the_way' then
    select l.lat, l.lng, l.updated_at, l.rider_name into r_lat, r_lng, r_at, r_name
      from public.rider_locations l where l.rider_id = o.rider_id order by l.updated_at desc limit 1;
  end if;
  return jsonb_build_object(
    'id', o.id, 'order_number', o.order_number, 'order_status', o.order_status, 'created_at', o.created_at,
    'payment_method', o.payment_method,
    'delivery_address', case when live then o.delivery_address end,
    'delivery_lat', case when live then o.delivery_lat end, 'delivery_lng', case when live then o.delivery_lng end,
    'rider_name', o.rider_name,
    'vendor_name', o.vendor_name, 'vendor_type', public._vendor_type(o.vendor_name),
    'subtotal', o.subtotal, 'delivery_fee', o.delivery_fee,
    'discount', o.discount, 'total', o.total, 'loyalty_free', o.loyalty_free,
    'items', coalesce((select jsonb_agg(jsonb_build_object('product_name', i.product_name, 'quantity', i.quantity,
                                                           'unit_price', i.unit_price, 'total_price', i.total_price))
                         from public.order_items i where i.order_id = o.id), '[]'::jsonb),
    'rider', case when r_lat is not null and r_lng is not null
                  then jsonb_build_object('lat', r_lat, 'lng', r_lng, 'updated_at', r_at, 'name', r_name) end);
end $f$;

create or replace function public.customer_cancel_info(p_order_number text, p_phone text)
 returns jsonb language plpgsql volatile security definer set search_path to ''
as $f$
declare o public.orders;
begin
  if length(public.ds_phone9(p_phone)) < 9 or coalesce(btrim(p_order_number), '') = '' then return jsonb_build_object('found', false); end if;
  if not public._ds_lookup_ok(public.ds_phone9(p_phone) || '#' || btrim(p_order_number)) then return jsonb_build_object('found', false); end if;   -- F1
  select * into o from public.orders
   where order_number = btrim(p_order_number) and deleted_at is null and public.ds_phone9(customer_phone) = public.ds_phone9(p_phone)
   order by created_at desc limit 1;
  if not found then return jsonb_build_object('found', false); end if;
  return public._cancel_check(o);
end $f$;

create or replace function public.customer_cancel_order(p_order_number text, p_phone text, p_reason text default null::text)
 returns jsonb language plpgsql security definer set search_path to ''
as $f$
declare o public.orders; r jsonb;
begin
  if length(public.ds_phone9(p_phone)) < 9 or coalesce(btrim(p_order_number), '') = '' then return jsonb_build_object('ok', false, 'why', 'not_found'); end if;
  if not public._ds_lookup_ok(public.ds_phone9(p_phone) || '#' || btrim(p_order_number)) then return jsonb_build_object('ok', false, 'why', 'not_found'); end if;   -- F1
  select * into o from public.orders
   where order_number = btrim(p_order_number) and deleted_at is null and public.ds_phone9(customer_phone) = public.ds_phone9(p_phone)
   order by created_at desc limit 1 for update;
  if not found then return jsonb_build_object('ok', false, 'why', 'not_found'); end if;
  r := public._cancel_check(o);
  if not (r->>'can_cancel')::boolean then return r || jsonb_build_object('ok', false); end if;
  update public.orders
     set order_status = 'cancelled', cancelled_by = 'customer', cancelled_at = now(), updated_at = now(),
         cancel_reason = left(nullif(btrim(coalesce(p_reason, '')), ''), 200)
   where id = o.id;
  return r || jsonb_build_object('ok', true, 'status', 'cancelled', 'can_cancel', false, 'why', 'cancelled', 'seconds_left', 0, 'cancelled_by', 'customer');
end $f$;

create or replace function public.save_my_profile(p_phone text, p_name text, p_area text)
 returns boolean language plpgsql security definer set search_path to 'public', 'pg_temp'
as $f$
declare p9 text := public.ds_phone9(p_phone); nm text := left(nullif(btrim(p_name), ''), 80); ar text := left(nullif(btrim(p_area), ''), 120);
begin
  if length(p9) < 9 then return false; end if;
  if not public._ds_lookup_ok(p9) then return false; end if;   -- F1 lookup limit
  update public.customers set name = coalesce(nm, name), area = coalesce(ar, area) where public.ds_phone9(phone) = p9;
  if not found then
    insert into public.customers(phone, name, area) values (p9, nm, ar)
    on conflict (phone) do update set name = coalesce(excluded.name, customers.name), area = coalesce(excluded.area, customers.area);
  end if;
  return true;
end $f$;

-- 3) delete = request. The old function keeps working, under a new name the app can't call.
alter function public.delete_my_account(text) rename to _ds_delete_account_now;
revoke execute on function public._ds_delete_account_now(text) from public, anon, authenticated;

create or replace function public.delete_my_account(p_phone text) returns jsonb
language plpgsql security definer set search_path = '' as $f$
declare p9 text := public.ds_phone9(p_phone);
begin
  if length(p9) < 9 or p9 = '000000000' then return jsonb_build_object('ok', false); end if;
  if not public._ds_lookup_ok(p9) then return jsonb_build_object('ok', false, 'why', 'too_many'); end if;
  insert into ds_work.account_deletion_requests (phone9, ip) values (p9, public._ds_client_ip())
    on conflict (phone9) where status = 'pending' do nothing;
  return jsonb_build_object('ok', true, 'pending', true);
end $f$;
grant execute on function public.delete_my_account(text) to anon, authenticated;

-- Admin: list + decide (Dashboard card)
create or replace function public.admin_deletion_requests() returns jsonb
language plpgsql stable security definer set search_path = '' as $f$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(x order by x.pending desc, x.requested_at desc) from (
    select r.id, '0' || r.phone9 as phone, r.status, r.requested_at, r.decided_at, (r.status = 'pending') as pending,
           (select c.name from public.customers c where public.ds_phone9(c.phone) = r.phone9 limit 1) as name,
           (select count(*) from public.orders o where public.ds_phone9(o.customer_phone) = r.phone9 and o.deleted_at is null) as orders,
           (select max(o.created_at) from public.orders o where public.ds_phone9(o.customer_phone) = r.phone9) as last_order
      from ds_work.account_deletion_requests r
     where r.status = 'pending' or r.decided_at > now() - interval '30 days'
     order by r.requested_at desc limit 50) x), '[]'::jsonb);
end $f$;

create or replace function public.admin_deletion_decide(p_id bigint, p_approve boolean) returns jsonb
language plpgsql security definer set search_path = '' as $f$
declare r ds_work.account_deletion_requests; res jsonb;
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into r from ds_work.account_deletion_requests where id = p_id for update;
  if not found or r.status <> 'pending' then return jsonb_build_object('ok', false, 'why', 'not_pending'); end if;
  if p_approve then res := public._ds_delete_account_now(r.phone9); end if;
  update ds_work.account_deletion_requests
     set status = case when p_approve then 'approved' else 'rejected' end, decided_at = now(), decided_by = auth.uid(), result = res
   where id = r.id;
  return jsonb_build_object('ok', true, 'approved', p_approve, 'result', res);
end $f$;
revoke execute on function public.admin_deletion_requests() from public, anon;
revoke execute on function public.admin_deletion_decide(bigint, boolean) from public, anon;
grant execute on function public.admin_deletion_requests() to authenticated;
grant execute on function public.admin_deletion_decide(bigint, boolean) to authenticated;
