-- Undo security step C1: removes only what C1 added (nothing else used these names before).
drop function if exists public.delete_my_account_v2(text);
drop function if exists public.customer_cancel_order_v2(text, text, text);
drop function if exists public.customer_cancel_info_v2(text, text);
drop function if exists public.referral_balance_v2(text);
drop function if exists public.referral_me_v2(text);
drop function if exists public.loyalty_status_v2(text);
drop function if exists public.save_my_profile_v2(text, text, text);
drop function if exists public.track_order_v2(text, text);
drop function if exists public.my_orders_v2(text);
drop function if exists public.customer_logout(text, boolean);
drop function if exists public.customer_me(text);
drop function if exists public._customer_of(text);
drop function if exists public.customer_verify_code(text, text, text);
drop function if exists public.customer_otp_create(text, text, text);
drop table if exists public.customer_sessions;
drop table if exists public.customer_otp;
