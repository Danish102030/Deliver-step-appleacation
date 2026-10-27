-- STATUS: written 2026-10-27, NOT applied yet (waiting for the owner to confirm the database change).
-- Loyalty-card reminders (owner approved 2026-10-27): app notifications to customers who are
--   ① one order away from the free delivery (9 of 10), ② just earned it (10 of 10), ③ have it unused for 7 days.
-- Max 1 reminder a week per customer, only 12:00–21:00 Saudi time, only app customers (token on their latest order),
-- only customers who ordered in the last 180 days. Admin: Marketing → Loyalty reminders (on/off, texts, numbers).
-- Measuring: «tapped» = taps on the reminder (push_notifications row per kind + notif_clicks, like offers),
--            «ordered» = an order by the same phone within 3 days after the reminder.

create table if not exists public.loyalty_reminder_log(
  id bigserial primary key,
  phone9 text not null,
  token text,
  kind text not null check (kind in ('one_away', 'earned', 'unused')),
  level int not null,                    -- which free delivery (1st, 2nd …) the reminder is about
  notif_id bigint,
  sent_at timestamptz not null default now());
create unique index if not exists loyalty_reminder_log_once on public.loyalty_reminder_log(phone9, kind, level);
create index if not exists loyalty_reminder_log_sent on public.loyalty_reminder_log(sent_at);
alter table public.loyalty_reminder_log enable row level security;          -- no policies: closed to the public
revoke all on public.loyalty_reminder_log from anon, authenticated;

-- one notification row per kind → taps are counted like the owner's offers (?n=<id> → increment_notif_click)
insert into public.push_notifications(title_ar, title_en, body_ar, body_en, target, status, recipients)
select v.t, v.t, v.b, v.b, 'loyalty_' || v.k, 'auto', 0
from (values ('one_away', 'باقي لك طلب واحد بس 🎯', 'طلبك الجاي يكمل بطاقة الولاء، وبعده التوصيل علينا 🎁'),
             ('earned',   'مبروك! توصيلك القادم مجاني 🎉', 'كملت 10 طلبات — اطلب متى ما حبيت والتوصيل علينا 🛵'),
             ('unused',   'توصيلك المجاني بانتظارك 🎁', 'لا تنسى — عندك توصيل مجاني جاهز، اطلب وجبتك الحين')) v(k, t, b)
where not exists (select 1 from public.push_notifications p where p.target = 'loyalty_' || v.k);

-- settings: on/off + texts (Admin edits them)
insert into public.settings(key, value)
select 'loyalty_reminders', jsonb_build_object('on', true, 'texts', jsonb_build_object(
  'one_away', jsonb_build_object('title', 'باقي لك طلب واحد بس 🎯', 'body', 'طلبك الجاي يكمل بطاقة الولاء، وبعده التوصيل علينا 🎁'),
  'earned',   jsonb_build_object('title', 'مبروك! توصيلك القادم مجاني 🎉', 'body', 'كملت 10 طلبات — اطلب متى ما حبيت والتوصيل علينا 🛵'),
  'unused',   jsonb_build_object('title', 'توصيلك المجاني بانتظارك 🎁', 'body', 'لا تنسى — عندك توصيل مجاني جاهز، اطلب وجبتك الحين')))::text
where not exists (select 1 from public.settings where key = 'loyalty_reminders');

-- send one notification (same way as the cart reminders), the tap opens the app and is counted
create or replace function public._loyalty_push(p_token text, p_title text, p_body text, p_nid bigint)
returns void language plpgsql set search_path to 'public', 'pg_temp' as $f$
declare u text := 'https://deliverystep.app/' || case when p_nid is not null then '?n=' || p_nid else '' end;
begin
  if (session_user = 'authenticator' or coalesce(current_setting('request.jwt.claims', true), '') <> '') and not public.is_admin() then
    raise exception 'not allowed';
  end if;
  perform net.http_post(
    url := 'https://deliverystep.app/notify.php',
    body := jsonb_build_object('payload', jsonb_build_object(
      'registration_ids', jsonb_build_array(p_token),
      'notification', jsonb_build_object('title', p_title, 'body', p_body),
      'data', jsonb_build_object('title_ar', p_title, 'title_en', p_title, 'body_ar', p_body, 'body_en', p_body,
                                 'type', 'loyalty', 'url', u, 'notif_id', coalesce(p_nid::text, '')))),
    headers := '{"Content-Type":"application/json"}'::jsonb,
    timeout_milliseconds := 30000);
end $f$;
revoke all on function public._loyalty_push(text, text, text, bigint) from public, anon, authenticated;

-- who should get which reminder now (one per customer); p_send=false only lists them
create or replace function public.send_loyalty_reminders(p_force boolean default false, p_send boolean default true)
returns json language plpgsql security definer set search_path to 'public', 'pg_temp' as $f$
declare cfg jsonb; h int := extract(hour from (now() at time zone 'Asia/Riyadh')); r record; n int := 0; out json; nid bigint; t jsonb;
begin
  begin cfg := (select value::jsonb from public.settings where key = 'loyalty_reminders'); exception when others then cfg := null; end;
  if not p_force and (cfg is null or coalesce((cfg->>'on')::boolean, false) = false) then return json_build_object('sent', 0, 'why', 'off'); end if;
  if not p_force and (h < 12 or h >= 21) then return json_build_object('sent', 0, 'why', 'quiet hours'); end if;
  create temp table if not exists _lr_pick(phone9 text, tok text, kind text, level int, name text) on commit drop;
  truncate _lr_pick;
  insert into _lr_pick
  with c as (
    select public.ds_phone9(o.customer_phone) p9,
      count(*) filter (where o.order_status = 'delivered' or o.created_at < now() - interval '3 days') cnt,
      count(*) filter (where o.loyalty_free) used, max(o.created_at) last_at,
      (array_agg(o.device_token order by o.created_at desc) filter (where coalesce(o.device_token, '') <> ''))[1] tok,
      (array_agg(o.customer_name order by o.created_at desc))[1] nm
    from public.orders o
    where o.deleted_at is null and coalesce(o.order_status, '') !~* '^cancel' and coalesce(o.order_status, '') <> 'on_hold'
      and length(public.ds_phone9(o.customer_phone)) = 9
    group by 1),
  s as (
    select c.*, c.cnt % 10 progress, c.cnt / 10 lvl, greatest(0, c.cnt / 10 - coalesce(b.rewards_done, 0) - c.used) avail
    from c left join public.loyalty_baseline b on b.phone9 = c.p9
    where c.tok is not null and c.last_at > now() - interval '180 days'
      and exists (select 1 from public.device_tokens d where d.token = c.tok and d.disabled_at is null)
      and not exists (select 1 from public.orders o2 where public.ds_phone9(o2.customer_phone) = c.p9 and o2.created_at > now() - interval '12 hours')),
  k as (
    select s.*,
      case
        when s.avail > 0 and not exists (select 1 from public.loyalty_reminder_log l where l.phone9 = s.p9 and l.level = s.lvl and l.kind in ('earned', 'unused'))
          then case when s.last_at < now() - interval '7 days' then 'unused' else 'earned' end
        when s.avail > 0 and exists (select 1 from public.loyalty_reminder_log l where l.phone9 = s.p9 and l.level = s.lvl and l.kind = 'earned' and l.sent_at < now() - interval '7 days')
             and not exists (select 1 from public.loyalty_reminder_log l where l.phone9 = s.p9 and l.level = s.lvl and l.kind = 'unused')
             and s.last_at < now() - interval '7 days'
          then 'unused'
        when s.avail = 0 and s.progress = 9 and not exists (select 1 from public.loyalty_reminder_log l where l.phone9 = s.p9 and l.level = s.lvl + 1 and l.kind = 'one_away')
          then 'one_away'
      end kind
    from s)
  select k.p9, k.tok, k.kind, case when k.kind = 'one_away' then k.lvl + 1 else k.lvl end, k.nm
  from k
  where k.kind is not null
    -- max 1 reminder a week; «earned» right after «one away» is the natural follow-up and may come sooner
    and not exists (select 1 from public.loyalty_reminder_log l where l.phone9 = k.p9 and l.sent_at > now() - interval '7 days'
                     and not (k.kind = 'earned' and l.kind = 'one_away'))
  limit 60;
  if not p_send then
    select json_build_object('sent', 0, 'would_send', coalesce(json_agg(json_build_object('kind', kind, 'level', level)), '[]'::json)) into out from _lr_pick;
    return out;
  end if;
  for r in select * from _lr_pick loop
    t := coalesce(cfg->'texts'->r.kind, '{}'::jsonb);
    select id into nid from public.push_notifications where target = 'loyalty_' || r.kind order by id limit 1;
    insert into public.loyalty_reminder_log(phone9, token, kind, level, notif_id) values (r.phone9, r.tok, r.kind, r.level, nid)
      on conflict (phone9, kind, level) do nothing;
    if found then
      perform public._loyalty_push(r.tok, coalesce(nullif(t->>'title', ''), 'خطوة التوصيل'), coalesce(nullif(t->>'body', ''), ''), nid);
      update public.push_notifications set recipients = coalesce(recipients, 0) + 1, sent_count = coalesce(sent_count, 0) + 1 where id = nid;
      n := n + 1;
    end if;
  end loop;
  return json_build_object('sent', n);
end $f$;
revoke all on function public.send_loyalty_reminders(boolean, boolean) from public, anon, authenticated;

-- Admin: «send to the waiting customers now» (ignores the time window, keeps the weekly limit)
create or replace function public.admin_loyalty_send_now() returns json
language plpgsql security definer set search_path to 'public', 'pg_temp' as $f$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return public.send_loyalty_reminders(true, true);
end $f$;
revoke all on function public.admin_loyalty_send_now() from public, anon;
grant execute on function public.admin_loyalty_send_now() to authenticated;

-- Admin: numbers + the waiting customers (also the ones without the app → WhatsApp)
create or replace function public.admin_loyalty_stats(p_days int default 30) returns json
language plpgsql stable security definer set search_path to 'public', 'pg_temp' as $f$
declare r json;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  with c as (
    select public.ds_phone9(o.customer_phone) p9,
      count(*) filter (where o.order_status = 'delivered' or o.created_at < now() - interval '3 days') cnt,
      count(*) filter (where o.loyalty_free) used, max(o.created_at) last_at,
      (array_agg(o.device_token order by o.created_at desc) filter (where coalesce(o.device_token, '') <> ''))[1] tok,
      (array_agg(o.customer_name order by o.created_at desc))[1] nm
    from public.orders o
    where o.deleted_at is null and coalesce(o.order_status, '') !~* '^cancel' and coalesce(o.order_status, '') <> 'on_hold'
      and length(public.ds_phone9(o.customer_phone)) = 9
    group by 1),
  s as (
    select c.*, c.cnt % 10 progress, greatest(0, c.cnt / 10 - coalesce(b.rewards_done, 0) - c.used) avail,
      (c.tok is not null and exists (select 1 from public.device_tokens d where d.token = c.tok and d.disabled_at is null)) app
    from c left join public.loyalty_baseline b on b.phone9 = c.p9
    where c.last_at > now() - interval '180 days'),
  w as (select * from s where s.avail > 0 or s.progress = 9),
  lg as (
    select l.*,
      (select min(o.created_at) from public.orders o where public.ds_phone9(o.customer_phone) = l.phone9 and o.created_at > l.sent_at
         and o.created_at <= l.sent_at + interval '3 days' and coalesce(o.order_status, '') !~* '^cancel') ordered_at,
      (select o.total from public.orders o where public.ds_phone9(o.customer_phone) = l.phone9 and o.created_at > l.sent_at
         and o.created_at <= l.sent_at + interval '3 days' and coalesce(o.order_status, '') !~* '^cancel' order by o.created_at limit 1) order_total
    from public.loyalty_reminder_log l where l.sent_at > now() - make_interval(days => p_days))
  select json_build_object(
    'free_waiting', (select count(*) from w where avail > 0), 'free_waiting_app', (select count(*) from w where avail > 0 and app),
    'one_away', (select count(*) from w where avail = 0 and progress = 9), 'one_away_app', (select count(*) from w where avail = 0 and progress = 9 and app),
    'kinds', (select json_object_agg(k.kind, json_build_object(
                'sent', (select count(*) from lg where lg.kind = k.kind),
                'tapped', (select count(*) from public.notif_clicks nc join public.push_notifications p on p.id = nc.notif_id
                            where p.target = 'loyalty_' || k.kind and nc.clicked_at > now() - make_interval(days => p_days)),
                'ordered', (select count(*) from lg where lg.kind = k.kind and lg.ordered_at is not null),
                'sales', (select coalesce(sum(lg.order_total), 0) from lg where lg.kind = k.kind and lg.ordered_at is not null)))
              from (values ('one_away'), ('earned'), ('unused')) k(kind)),
    'sent_week', (select count(*) from public.loyalty_reminder_log where sent_at > now() - interval '7 days'),
    'waiting', (select coalesce(json_agg(json_build_object('name', w.nm, 'phone', '966' || w.p9, 'free', w.avail > 0, 'progress', w.progress,
                   'app', w.app, 'last_at', w.last_at,
                   'reminded_at', (select max(l.sent_at) from public.loyalty_reminder_log l where l.phone9 = w.p9))
                 order by (w.avail > 0) desc, w.last_at desc), '[]'::json) from w))
  into r;
  return r;
end $f$;
revoke all on function public.admin_loyalty_stats(int) from public, anon;
grant execute on function public.admin_loyalty_stats(int) to authenticated;

-- every hour at :07 (the function itself keeps 12:00–21:00 Saudi time)
select cron.schedule('loyalty-reminders', '7 * * * *', 'select public.send_loyalty_reminders();');
