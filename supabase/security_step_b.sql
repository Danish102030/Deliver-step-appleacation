-- Security step B (2026-11-03, owner approved): close open rules that no app needs.
-- Riders keep using rider_duty_* (SECURITY DEFINER, owner postgres bypasses RLS) and admins keep their
-- "admin full access" rules. Customers can still ADD page visits and tap notifications (increment_notif_click).
-- Undo: security_step_b_rollback.sql
alter policy "public read duty_shifts"   on public.duty_shifts using (false);
alter policy "public change duty_shifts" on public.duty_shifts using (false) with check (false);
alter policy "public add duty_shifts"    on public.duty_shifts with check (false);
alter policy notif_clicks_rw on public.notif_clicks using (false) with check (false);
alter policy "Admin can read visits" on public.page_visits using (false);
-- unused by every app and callable by anyone: keep the name, do nothing
create or replace function public.sync_customer_points(p_phone text) returns void
  language plpgsql security definer set search_path = '' as $$ begin return; end $$;
create or replace function public.sync_order_count(p_phone text) returns void
  language plpgsql security definer set search_path = '' as $$ begin return; end $$;
