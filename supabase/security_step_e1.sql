-- Security step E1 (draft 2026-11-05): customer text can never become code in the rider app or the admin panel.
-- rider.html (server-only, cannot be re-uploaded in full) puts many order fields into the page without escaping,
-- and place_order saves whatever a phone sends. So the database cleans the text when an order is saved:
--   • in names, address, notes, phone, product names …  < > " ' `  become look-alike letters ‹ › ″ ʼ ʹ
--     (nothing else changes; Arabic text, numbers, emojis, new lines stay as they are)
--   • picture links must be plain https:// links, otherwise they are left empty
-- Not touched: order_status, rider_name, device_token, client_ref, wa_order_number (CRM), and every crm_* / wa_* object.
-- Checked on 5 Nov: no order or item contains < > or a bad link today; 74 product names contain ' and 3 contain "
-- (they keep a look-alike letter from now on). Undo: security_step_e1_rollback.sql
create or replace function public.ds_safe_text(p text) returns text
language sql immutable parallel safe set search_path = '' as $$
  select case when p is null then null
    else translate(regexp_replace(p, '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g'), '<>"''`', '‹›″ʼʹ') end
$$;

create or replace function public.ds_safe_url(p text) returns text
language sql immutable parallel safe set search_path = '' as $$
  select case when p is null or btrim(p) = '' then p
              when btrim(p) ~ '^https://[^\s"''<>`\\]+$' then btrim(p)
              else null end
$$;

create or replace function public._ds_clean_order_text() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.order_number     := public.ds_safe_text(new.order_number);
  new.customer_name    := public.ds_safe_text(new.customer_name);
  new.customer_phone   := public.ds_safe_text(new.customer_phone);
  new.customer_whatsapp:= public.ds_safe_text(new.customer_whatsapp);
  new.delivery_address := public.ds_safe_text(new.delivery_address);
  new.delivery_notes   := public.ds_safe_text(new.delivery_notes);
  new.delivery_type    := public.ds_safe_text(new.delivery_type);
  new.scheduled_time   := public.ds_safe_text(new.scheduled_time);
  new.payment_method   := public.ds_safe_text(new.payment_method);
  new.payment_status   := public.ds_safe_text(new.payment_status);
  new.promo_code       := public.ds_safe_text(new.promo_code);
  new.notes            := public.ds_safe_text(new.notes);
  new.vendor_name      := public.ds_safe_text(new.vendor_name);
  new.vendor_whatsapp  := public.ds_safe_text(new.vendor_whatsapp);
  new.ref_code         := public.ds_safe_text(new.ref_code);
  new.cancel_reason    := public.ds_safe_text(new.cancel_reason);
  return new;
end $$;

create or replace function public._ds_clean_item_text() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.product_name      := public.ds_safe_text(new.product_name);
  new.vendor_name       := public.ds_safe_text(new.vendor_name);
  new.product_image     := public.ds_safe_url(new.product_image);
  new.image_url         := public.ds_safe_url(new.image_url);
  new.product_image_url := public.ds_safe_url(new.product_image_url);
  return new;
end $$;

-- "a0" = runs before the other BEFORE triggers (they run in name order)
create trigger trg_a0_ds_clean_text before insert or update on public.orders
  for each row execute function public._ds_clean_order_text();
create trigger trg_a0_ds_clean_text before insert or update on public.order_items
  for each row execute function public._ds_clean_item_text();
