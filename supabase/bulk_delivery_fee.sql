-- One delivery fee for many shops at once (owner approved the mockup 15 Nov 2026).
-- Admin → Settings → Delivery fees → "Restaurants & cafés — one fee for many shops".
-- Groups: restaurants (every category except coffee / buffet* / ds_store), coffee, buffet. Only active shops.
-- Every change first saves the old prices in ds_work.delivery_fee_backups, so "Undo last change" puts them back.
-- Undo this file: drop the 4 functions and the backup table.

create table if not exists ds_work.delivery_fee_backups (
  id        bigserial primary key,
  at        timestamptz not null default now(),
  by_user   uuid,
  groups    text[],
  rows      jsonb not null,
  undone_at timestamptz
);
alter table ds_work.delivery_fee_backups enable row level security;   -- read only through the functions below

create or replace function public._ds_fee_group(p_category text) returns text
language sql immutable parallel safe set search_path = '' as $$
  select case when p_category = 'coffee' then 'coffee'
              when p_category like 'buffet%' then 'buffet'
              when p_category = 'ds_store' then 'ds_store'
              else 'restaurants' end
$$;

-- p_disc_min / p_disc_fee null = keep each shop's own cheaper-delivery offer; p_disc_min 0 = offer off
create or replace function public.admin_bulk_delivery_fee(p_groups text[], p_fee numeric,
                                                          p_disc_min numeric default null, p_disc_fee numeric default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare n int; snap jsonb; bid bigint;
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_groups is null or cardinality(p_groups) = 0 or not (p_groups <@ array['restaurants','coffee','buffet']) then
    raise exception 'Choose restaurants, coffee or buffets'; end if;
  if p_fee is null or p_fee < 0 or p_fee > 50 then raise exception 'Check the delivery fee (0–50 SAR)'; end if;
  if p_disc_min is not null and (p_disc_min < 0 or p_disc_min > 1000) then raise exception 'Check the cheaper-delivery amount'; end if;
  if p_disc_fee is not null and (p_disc_fee < 0 or p_disc_fee > 50) then raise exception 'Check the cheaper-delivery fee'; end if;
  select jsonb_agg(jsonb_build_object('id', id, 'delivery_fee', delivery_fee,
                   'delivery_discount_min', delivery_discount_min, 'delivery_discount_fee', delivery_discount_fee))
    into snap from public.restaurants
   where coalesce(is_active, true) and public._ds_fee_group(category) = any (p_groups);
  if snap is null then return jsonb_build_object('ok', true, 'changed', 0); end if;
  insert into ds_work.delivery_fee_backups (by_user, groups, rows) values (auth.uid(), p_groups, snap) returning id into bid;
  update public.restaurants r
     set delivery_fee          = p_fee,
         delivery_discount_min = case when p_disc_min is null then r.delivery_discount_min else p_disc_min end,
         delivery_discount_fee = case when p_disc_min is null then r.delivery_discount_fee
                                      when p_disc_min = 0 then 0 else coalesce(p_disc_fee, r.delivery_discount_fee) end
   where coalesce(r.is_active, true) and public._ds_fee_group(r.category) = any (p_groups);
  get diagnostics n = row_count;
  return jsonb_build_object('ok', true, 'changed', n, 'backup', bid);
end $$;

create or replace function public.admin_bulk_delivery_fee_last() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare b ds_work.delivery_fee_backups;
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into b from ds_work.delivery_fee_backups where undone_at is null order by id desc limit 1;
  if not found then return null; end if;
  return jsonb_build_object('at', b.at, 'groups', b.groups, 'shops', jsonb_array_length(b.rows));
end $$;

create or replace function public.admin_bulk_delivery_fee_undo() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare b ds_work.delivery_fee_backups; n int;
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into b from ds_work.delivery_fee_backups where undone_at is null order by id desc limit 1 for update;
  if not found then return jsonb_build_object('ok', false, 'why', 'Nothing to undo'); end if;
  update public.restaurants r
     set delivery_fee          = (x ->> 'delivery_fee')::numeric,
         delivery_discount_min = (x ->> 'delivery_discount_min')::numeric,
         delivery_discount_fee = (x ->> 'delivery_discount_fee')::numeric
    from jsonb_array_elements(b.rows) x
   where r.id = (x ->> 'id')::uuid;
  get diagnostics n = row_count;
  update ds_work.delivery_fee_backups set undone_at = now() where id = b.id;
  return jsonb_build_object('ok', true, 'restored', n, 'at', b.at);
end $$;
