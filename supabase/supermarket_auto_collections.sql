-- Applied 2026-10-24 (owner approved): new / moved supermarket products join the time collections by themselves.
-- Mapping = ds_work.sm_coll (sub-section → collection, plus a few name rules). Hand-added collections are kept.
-- Checked before applying: the rule gives exactly the approved collections for all 1,948 active products.
create or replace function ds_work.sm_auto_coll(cat text, nm text) returns text[]
language sql stable security definer set search_path = '' as $b$
  select coalesce(array_agg(distinct c.coll order by c.coll), '{}')
  from ds_work.sm_coll c
  where c.sub = cat or (c.sub is null and translate(coalesce(nm,''),'ةىیکأإآ','هييكااا') ~ c.pat)
$b$;
revoke all on function ds_work.sm_auto_coll(text, text) from public, anon, authenticated;

create or replace function public.sm_products_auto_coll() returns trigger
language plpgsql security definer set search_path = '' as $b$
declare keep text[];
begin
  if tg_op = 'INSERT' then
    keep := coalesce(new.collections, '{}');
  elsif new.category_name is distinct from old.category_name or new.name is distinct from old.name then
    keep := array(select x from unnest(coalesce(new.collections,'{}')) x
                  where x <> all (ds_work.sm_auto_coll(old.category_name, old.name)));
  else
    return new;
  end if;
  new.collections := array(select distinct x from unnest(keep || ds_work.sm_auto_coll(new.category_name, new.name)) x order by x);
  return new;
end $b$;
revoke all on function public.sm_products_auto_coll() from public, anon, authenticated;

create trigger trg_sm_products_auto_coll before insert or update of category_name, name on public.supermarket_products
  for each row execute function public.sm_products_auto_coll();
-- Undo: alter table public.supermarket_products disable trigger trg_sm_products_auto_coll;
