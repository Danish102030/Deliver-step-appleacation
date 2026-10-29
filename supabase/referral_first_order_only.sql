-- Applied 2026-10-25 (owner approved, after DS-292806 got the friend gift on a 3rd order):
-- the friend gift (free delivery) is only for a phone with no earlier (not cancelled) order.
create or replace function public.referral_check_code(p_code text, p_phone text)
returns boolean language sql stable security definer set search_path to 'public', 'pg_temp' as $f$
  select exists (select 1 from public.referral_accounts a
                  where a.referral_code = upper(btrim(coalesce(p_code, '')))
                    and (length(public.ds_phone9(p_phone)) < 9 or public.ds_phone9(a.phone) <> public.ds_phone9(p_phone)))
     and (length(public.ds_phone9(p_phone)) < 9
          or not exists (select 1 from public.orders o
                          where public.ds_phone9(o.customer_phone) = public.ds_phone9(p_phone)
                            and coalesce(o.order_status, '') !~* '^cancel'))
$f$;
