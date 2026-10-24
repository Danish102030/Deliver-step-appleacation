-- Applied 2026-10-24 (owner approved): gift-card brands in متجر خطوة (Free Fire, PUBG, PlayStation …).
-- A department with gift=true is one brand; its products are the packs ("530 جوهرة" + price).
-- Customers get the code on WhatsApp after a bank transfer (cart line id "<item>|code", ds_digital → no rider).
alter table public.ds_store_departments
  add column if not exists gift boolean not null default false,
  add column if not exists image_url text,      -- brand picture (tile)
  add column if not exists card_title text,     -- big word on the card, e.g. FREE FIRE (empty = automatic)
  add column if not exists card_unit text,      -- word on the card bar, e.g. Diamonds / UC / $ (empty = automatic)
  add column if not exists card_color text;     -- blue, orange, gold, black, green, purple, red (empty = automatic)
