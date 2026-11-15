-- Undo security step E1: removes the two cleaning triggers and their functions (saved text is not changed back).
drop trigger if exists trg_a0_ds_clean_text on public.orders;
drop trigger if exists trg_a0_ds_clean_text on public.order_items;
drop function if exists public._ds_clean_order_text();
drop function if exists public._ds_clean_item_text();
drop function if exists public.ds_safe_url(text);
drop function if exists public.ds_safe_text(text);
