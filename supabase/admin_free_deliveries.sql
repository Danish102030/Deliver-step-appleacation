-- Applied 2026-10-25 (owner approved): Admin Dashboard → 🎁 Free deliveries.
-- Loyalty card = orders.loyalty_free; friend's first order = orders.ref_code (invite link). Delivered orders only, Saudi time.
create or replace function public.admin_free_deliveries(p_period text default 'month')
returns json language plpgsql stable security definer set search_path = 'public', 'pg_temp' as $f$
declare t0 timestamptz; t1 timestamptz; sa timestamp := (now() at time zone 'Asia/Riyadh'); r json;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if p_period = 'last_month' then
    t0 := (date_trunc('month', sa) - interval '1 month') at time zone 'Asia/Riyadh'; t1 := date_trunc('month', sa) at time zone 'Asia/Riyadh';
  elsif p_period = '7d' then
    t0 := now() - interval '7 days'; t1 := now();
  else
    t0 := date_trunc('month', sa) at time zone 'Asia/Riyadh'; t1 := now();
  end if;
  with o as (select * from public.orders where created_at >= t0 and created_at < t1 and order_status = 'delivered')
  select json_build_object(
    'from', t0, 'to', t1,
    'delivered', count(*),
    'loyalty', count(*) filter (where loyalty_free),
    'loyalty_customers', count(distinct public.ds_phone9(customer_phone)) filter (where loyalty_free),
    'friend', count(*) filter (where ref_code is not null and not coalesce(loyalty_free, false)),
    'avg_fee', coalesce(round(avg(delivery_fee) filter (where delivery_fee > 0), 2), 0),
    'fees_paid', coalesce(round(sum(delivery_fee) filter (where delivery_fee > 0), 0), 0),
    'not_first', coalesce((select json_agg(json_build_object('id', x.id, 'num', x.order_number, 'at', x.created_at) order by x.created_at desc)
                  from o x where x.ref_code is not null and coalesce(x.delivery_fee, 0) = 0 and x.delivery_notes like '%للطلب الأول فقط%'), '[]'::json),
    'rewards', (select count(*) from public.referrals r where r.status in ('approved', 'completed') and coalesce(r.approved_at, r.completed_at, r.created_at) >= t0 and coalesce(r.approved_at, r.completed_at, r.created_at) < t1),
    'rewards_sr', (select coalesce(sum(r.reward_sr), 0) from public.referrals r where r.status in ('approved', 'completed') and coalesce(r.approved_at, r.completed_at, r.created_at) >= t0 and coalesce(r.approved_at, r.completed_at, r.created_at) < t1),
    'credit_used_sr', coalesce(sum(ref_credit_used), 0))
  into r from o;
  return r;
end $f$;
revoke all on function public.admin_free_deliveries(text) from public, anon;
grant execute on function public.admin_free_deliveries(text) to authenticated;
