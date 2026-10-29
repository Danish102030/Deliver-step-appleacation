-- New phones could not register for notifications from 21 Oct 2026 (applied 29 Oct, owner OK).
-- The iPhone app saves its token with POST /rest/v1/device_tokens + "Prefer: resolution=merge-duplicates"
-- (= INSERT … ON CONFLICT DO UPDATE). Postgres then also checks the SELECT policies on the new row, and since the
-- privacy step the table is unreadable from phones (USING false) → every NEW token was refused (401); tokens already
-- saved kept working because device_tokens_dedupe refreshes them and skips the insert.
-- Fix: the dedupe trigger marks the token being saved for this one statement, and a SELECT policy lets the row with
-- exactly that token pass the check. Reading the list from a phone still returns nothing.

create or replace function public.device_tokens_dedupe() returns trigger
language plpgsql security definer set search_path to 'public' as $$
begin
  -- this statement may "see" only the token it is saving (policy below) — needed by the app's upsert
  perform set_config('ds.tok_ins', coalesce(new.token, ''), true);
  -- Token already saved? refresh it (and switch it back on) and SKIP the insert (no error).
  update public.device_tokens
     set last_seen       = coalesce(new.last_seen, now()),
         platform        = coalesce(new.platform, platform),
         role            = case when new.role = 'rider' then 'rider' else role end,
         rider_name      = case when new.role = 'rider' then coalesce(new.rider_name, rider_name) else rider_name end,
         phone           = case when new.role = 'rider' then coalesce(new.phone, phone) else phone end,
         last_seen_at    = case when new.last_seen_at is not null then new.last_seen_at else last_seen_at end,
         disabled_at     = null,
         disabled_reason = null
   where token = new.token;
  if found then return null; end if;
  return new;
end $$;

create policy "app saves its own new token" on public.device_tokens for select to anon, authenticated
  using (token = current_setting('ds.tok_ins', true));

-- Phones missed since 21 Oct that ordered from the app (their token travels with the order): add them back.
insert into public.device_tokens (token, platform, last_seen, created_at)
select o.device_token, 'ios', max(o.created_at), min(o.created_at)
  from public.orders o
 where o.device_token is not null and o.device_token <> '' and o.created_at > '2026-10-20'
   and not exists (select 1 from public.device_tokens d where d.token = o.device_token)
 group by o.device_token;
