-- 2026-11-11 (owner approved, applied as migration fix_storage_uploads_wa_team_check).
-- Problem: the CRM rule "order slips: team uploads own folder" (storage.objects, INSERT) read public.wa_team
-- directly. Logged-in users have no SELECT right on wa_team, and Postgres evaluates every INSERT rule, so EVERY
-- upload by a logged-in user failed with "permission denied for table wa_team" (menu photos, supermarket photos,
-- banners, the CRM's own slips). Last menu photo that worked: 7 Nov.
-- Fix: same rule, the team check goes through a SECURITY DEFINER helper. No new access to wa_team for anyone.
create or replace function public.ds_is_active_wa_member() returns boolean
  language sql stable security definer set search_path = '' as
$$ select exists (select 1 from public.wa_team t where t.user_id = auth.uid() and t.active) $$;
alter policy "order slips: team uploads own folder" on storage.objects
  with check ((bucket_id = 'order-slips') and ((storage.foldername(name))[1] = (auth.uid())::text)
              and (select public.ds_is_active_wa_member()));

-- UNDO (puts the rule back exactly as the CRM project wrote it):
-- alter policy "order slips: team uploads own folder" on storage.objects
--   with check ((bucket_id = 'order-slips') and ((storage.foldername(name))[1] = (auth.uid())::text)
--               and (exists (select 1 from wa_team t where t.user_id = auth.uid() and t.active)));
