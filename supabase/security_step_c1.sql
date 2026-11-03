-- Security step C1 (draft 2026-11-03): customers prove they own their phone with a WhatsApp code.
-- Adds new things only; nothing existing is changed, so the live apps keep working exactly as before.
--   customer_otp       codes (stored scrambled with bcrypt), 5 minutes, 5 tries, limits per phone / device / day
--   customer_sessions  login keys (only a SHA-256 of the key is stored), 90 days, can be logged out
--   customer_otp_create(...)   ONLY the server function customer-otp-send may call it (service role)
--   customer_verify_code(...)  the app sends phone + code, gets a login key back
--   *_v2(p_token, ...)         same answers as the old phone-only functions, but need the login key
-- The *_v2 functions call the old functions inside. Step C3 (switching the old ones off) must first move their
-- bodies into private core functions, or the *_v2 versions would stop working too.
-- Undo: security_step_c1_rollback.sql

create table if not exists public.customer_otp (
  id          bigserial primary key,
  phone9      text not null,
  code_hash   text not null,
  ip          text,
  device      text,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '5 minutes',
  tries       int not null default 0,
  used_at     timestamptz
);
create index if not exists customer_otp_phone_idx on public.customer_otp (phone9, created_at desc);
create index if not exists customer_otp_ip_idx    on public.customer_otp (ip, created_at desc);
create index if not exists customer_otp_day_idx   on public.customer_otp (created_at);
alter table public.customer_otp enable row level security;          -- no rules: only the functions below read it

create table if not exists public.customer_sessions (
  id           uuid primary key default gen_random_uuid(),
  phone9       text not null,
  token_hash   text not null unique,
  device       text,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '90 days',
  last_used_at timestamptz,
  revoked_at   timestamptz
);
create index if not exists customer_sessions_phone_idx on public.customer_sessions (phone9);
alter table public.customer_sessions enable row level security;     -- no rules: only the functions below read it

-- 1) Make a code. Called ONLY by the customer-otp-send server function (service role); it sends the code by
--    WhatsApp and never shows it to the browser. Limits: 1 code a minute and 3 per 10 minutes per phone,
--    8 per day per phone, 10 per hour per device/IP, 400 per day in total (protects the message budget).
create or replace function public.customer_otp_create(p_phone text, p_ip text default null, p_device text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  p9 text := public.ds_phone9(p_phone);
  v_ip text := left(nullif(btrim(coalesce(p_ip, '')), ''), 64);
  v_dev text := left(nullif(btrim(coalesce(p_device, '')), ''), 64);
  c text; last_at timestamptz; n10 int; nday int; nip int; nall int;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise exception 'not allowed' using errcode = '42501'; end if;
  if length(p9) <> 9 or left(p9, 1) <> '5' then return jsonb_build_object('ok', false, 'why', 'bad_phone'); end if;
  perform pg_advisory_xact_lock(hashtext('ds_otp:' || p9));
  select max(created_at), count(*) filter (where created_at > now() - interval '10 minutes'), count(*)
    into last_at, n10, nday from public.customer_otp where phone9 = p9 and created_at > now() - interval '1 day';
  if last_at > now() - interval '60 seconds' then
    return jsonb_build_object('ok', false, 'why', 'wait', 'seconds', ceil(extract(epoch from last_at + interval '60 seconds' - now())));
  end if;
  if n10 >= 3 or nday >= 8 then return jsonb_build_object('ok', false, 'why', 'too_many'); end if;
  if coalesce(v_ip, v_dev) is not null then
    select count(*) into nip from public.customer_otp o
     where o.created_at > now() - interval '1 hour' and ((v_ip is not null and o.ip = v_ip) or (v_dev is not null and o.device = v_dev));
    if nip >= 10 then return jsonb_build_object('ok', false, 'why', 'too_many'); end if;
  end if;
  select count(*) into nall from public.customer_otp where created_at > now() - interval '1 day';
  if nall >= 400 then return jsonb_build_object('ok', false, 'why', 'busy'); end if;
  update public.customer_otp set used_at = now() where phone9 = p9 and used_at is null;      -- older codes stop working
  c := lpad((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint % 1000000)::text, 6, '0');
  insert into public.customer_otp (phone9, code_hash, ip, device) values (p9, extensions.crypt(c, extensions.gen_salt('bf', 6)), v_ip, v_dev);
  return jsonb_build_object('ok', true, 'to', '966' || p9, 'code', c);
end $$;

-- 2) Check a code. Right code → a new login key (shown once; only its SHA-256 is kept). 5 wrong tries kill the code.
create or replace function public.customer_verify_code(p_phone text, p_code text, p_device text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  p9 text := public.ds_phone9(p_phone);
  cd text := regexp_replace(translate(coalesce(p_code, ''), '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789'), '\D', '', 'g');
  o public.customer_otp; tok text;
begin
  if length(p9) <> 9 or length(cd) <> 6 then return jsonb_build_object('ok', false, 'why', 'wrong'); end if;
  select * into o from public.customer_otp
   where phone9 = p9 and used_at is null and expires_at > now() order by created_at desc limit 1 for update;
  if not found then return jsonb_build_object('ok', false, 'why', 'expired'); end if;
  if o.tries >= 5 then
    update public.customer_otp set used_at = now() where id = o.id;
    return jsonb_build_object('ok', false, 'why', 'expired');
  end if;
  if extensions.crypt(cd, o.code_hash) <> o.code_hash then
    update public.customer_otp set tries = tries + 1, used_at = case when tries + 1 >= 5 then now() end where id = o.id;
    return jsonb_build_object('ok', false, 'why', 'wrong', 'left', greatest(0, 4 - o.tries));
  end if;
  update public.customer_otp set used_at = now() where id = o.id;
  tok := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.customer_sessions (phone9, token_hash, device)
  values (p9, encode(extensions.digest(tok, 'sha256'), 'hex'), left(nullif(btrim(coalesce(p_device, '')), ''), 64));
  -- at most 10 logged-in devices per phone: log out the oldest ones
  update public.customer_sessions set revoked_at = now()
   where phone9 = p9 and revoked_at is null and id not in
     (select id from public.customer_sessions where phone9 = p9 and revoked_at is null order by created_at desc limit 10);
  return jsonb_build_object('ok', true, 'token', tok, 'phone9', p9, 'expires_at', now() + interval '90 days');
end $$;

-- 3) Login key → phone (9 digits). Wrong, expired or logged-out key → error 'login_required' (the app shows the login).
create or replace function public._customer_of(p_token text)
returns text language plpgsql security definer set search_path = '' as $$
declare s public.customer_sessions;
begin
  if coalesce(length(p_token), 0) <> 64 then raise exception 'login_required' using errcode = '28000'; end if;
  select * into s from public.customer_sessions
   where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') and revoked_at is null and expires_at > now();
  if not found then raise exception 'login_required' using errcode = '28000'; end if;
  if s.last_used_at is null or s.last_used_at < now() - interval '1 hour' then
    update public.customer_sessions set last_used_at = now() where id = s.id;
  end if;
  return s.phone9;
end $$;

create or replace function public.customer_me(p_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare p9 text := public._customer_of(p_token); nm text;
begin
  select c.name into nm from public.customers c where public.ds_phone9(c.phone) = p9 order by (c.name is not null) desc limit 1;
  return jsonb_build_object('ok', true, 'phone9', p9, 'name', nm);
end $$;

create or replace function public.customer_logout(p_token text, p_all boolean default false)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare p9 text;
begin
  begin p9 := public._customer_of(p_token); exception when others then return jsonb_build_object('ok', true); end;
  if p_all then
    update public.customer_sessions set revoked_at = now() where phone9 = p9 and revoked_at is null;
  else
    update public.customer_sessions set revoked_at = now() where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
  end if;
  return jsonb_build_object('ok', true);
end $$;

-- 4) Token versions of the customer functions (same answers as today)
create or replace function public.my_orders_v2(p_token text) returns jsonb
  language sql security definer set search_path = '' as $$ select public.my_orders(public._customer_of(p_token)) $$;
create or replace function public.track_order_v2(p_token text, p_order_number text) returns jsonb
  language sql security definer set search_path = '' as $$ select public.track_order(p_order_number, public._customer_of(p_token)) $$;
create or replace function public.save_my_profile_v2(p_token text, p_name text, p_area text) returns boolean
  language sql security definer set search_path = '' as $$ select public.save_my_profile(public._customer_of(p_token), p_name, p_area) $$;
create or replace function public.loyalty_status_v2(p_token text) returns jsonb
  language sql security definer set search_path = '' as $$ select public.loyalty_status(public._customer_of(p_token)) $$;
create or replace function public.referral_me_v2(p_token text) returns jsonb
  language sql security definer set search_path = '' as $$ select public.referral_me(public._customer_of(p_token)) $$;
create or replace function public.referral_balance_v2(p_token text) returns numeric
  language sql security definer set search_path = '' as $$ select public.referral_balance(public._customer_of(p_token)) $$;
create or replace function public.customer_cancel_info_v2(p_token text, p_order_number text) returns jsonb
  language sql security definer set search_path = '' as $$ select public.customer_cancel_info(p_order_number, public._customer_of(p_token)) $$;
create or replace function public.customer_cancel_order_v2(p_token text, p_order_number text, p_reason text default null) returns jsonb
  language sql security definer set search_path = '' as $$ select public.customer_cancel_order(p_order_number, public._customer_of(p_token), p_reason) $$;

create or replace function public.delete_my_account_v2(p_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare p9 text := public._customer_of(p_token); r jsonb;
begin
  r := public.delete_my_account(p9);
  update public.customer_sessions set revoked_at = now() where phone9 = p9 and revoked_at is null;   -- logged out everywhere
  return r;
end $$;
