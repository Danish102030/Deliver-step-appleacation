# Saved ideas (for later)

Ideas the owner approved in principle but asked to keep for a future session.

## 1. Instant pages — no more grey loading boxes
- **Pages:** restaurants, coffee, supermarket (categories), menu (a restaurant's dishes).
- **Today:** every visit shows grey placeholder boxes for 0.5–2 s while the page asks the database, then the cards pop in.
- **Plan:** like the new home page (`ds_home_v2`):
  - show the last saved copy instantly (localStorage), then refresh from the database in the background and update quietly if something changed;
  - open / closed is still worked out from the opening hours, so it stays correct;
  - prices in the cart and at checkout still come from the database.
- **Tests to run:** weak internet, no internet, first visit, a shop closing, a price change.

## 2. Smooth page changes on the order pages
- order-tracking.html and order-confirmed.html need the same one-line `ds-smooth-1` addition (they are not in this repo — ask the owner for the latest copies).

## 3. Same bottom menu + smooth changes on other pages
- pharmacy, buffets, and any other page with a bottom menu: add `ds-lib/ds-nav-1.js` (after the menu) and `ds-smooth-1` (in the head). Ask the owner for the files.
