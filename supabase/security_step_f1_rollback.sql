-- Undo security step F1: the delete button deletes at once again, no lookup limit, tracking shows the address always.
-- (Run in the Supabase SQL editor. Pending deletion requests stay in ds_work.account_deletion_requests.)
drop function if exists public.admin_deletion_decide(bigint, boolean);
drop function if exists public.admin_deletion_requests();
drop function if exists public.delete_my_account(text);
alter function public._ds_delete_account_now(text) rename to delete_my_account;
grant execute on function public.delete_my_account(text) to anon, authenticated;

create or replace function public.my_orders(p_phone text)
 returns jsonb language plpgsql stable security definer set search_path to 'public', 'pg_temp'
as $f$
declare p9 text := public.ds_phone9(p_phone);
begin
  if length(p9) < 9 then return '[]'::jsonb; end if;
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
 returns jsonb language plpgsql stable security definer set search_path to 'public', 'pg_temp'
as $f$
declare
  p9 text := public.ds_phone9(p_phone);
  o public.orders%rowtype;
  r_lat numeric; r_lng numeric; r_at timestamptz; r_name text;
begin
  if length(p9) < 9 or coalesce(btrim(p_order_number), '') = '' then return null; end if;
  select * into o from public.orders
   where order_number = btrim(p_order_number) and deleted_at is null and public.ds_phone9(customer_phone) = p9
   order by created_at desc limit 1;
  if not found then return null; end if;
  if o.rider_id is not null and o.order_status = 'on_the_way' then
    select l.lat, l.lng, l.updated_at, l.rider_name into r_lat, r_lng, r_at, r_name
      from public.rider_locations l where l.rider_id = o.rider_id order by l.updated_at desc limit 1;
  end if;
  return jsonb_build_object(
    'id', o.id, 'order_number', o.order_number, 'order_status', o.order_status, 'created_at', o.created_at,
    'payment_method', o.payment_method, 'delivery_address', o.delivery_address,
    'delivery_lat', o.delivery_lat, 'delivery_lng', o.delivery_lng, 'rider_name', o.rider_name,
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
 returns jsonb language plpgsql stable security definer set search_path to ''
as $f$
declare o public.orders;
begin
  if length(public.ds_phone9(p_phone)) < 9 or coalesce(btrim(p_order_number), '') = '' then return jsonb_build_object('found', false); end if;
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
  update public.customers set name = coalesce(nm, name), area = coalesce(ar, area) where public.ds_phone9(phone) = p9;
  if not found then
    insert into public.customers(phone, name, area) values (p9, nm, ar)
    on conflict (phone) do update set name = coalesce(excluded.name, customers.name), area = coalesce(excluded.area, customers.area);
  end if;
  return true;
end $f$;

drop function if exists public._ds_lookup_ok(text);
drop function if exists public._ds_client_ip();
-- tables ds_work.phone_lookups / ds_work.account_deletion_requests are kept (harmless); drop them by hand if wanted.
