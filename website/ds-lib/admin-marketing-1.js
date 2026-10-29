/* Delivery Step Admin → Marketing (overview, notifications, referrals, cart + loyalty reminders, offers, banners,
   customer searches, visitors). Loaded by admin.html the first time one of these pages is opened (see _lazy).
   Keep the file name versioned (admin-marketing-1.js, -2.js …): files in ds-lib are cached for a year. */
(function(){
  var S={"marketing": "        <div class=\"mk-title\">📣 Marketing</div>\n        <div class=\"mk-sub\">Everything that brings customers in and back — one page. Numbers are for the last 30 days.</div>\n        <div class=\"mk-kpis\">\n          <div class=\"mk-k\"><div class=\"l\">Notifications sent</div><div class=\"n\" id=\"mk-k-notif\">—</div><div class=\"s\" id=\"mk-k-notif-s\"></div></div>\n          <div class=\"mk-k\"><div class=\"l\">Referral orders</div><div class=\"n\" id=\"mk-k-ref\">—</div><div class=\"s\" id=\"mk-k-ref-s\"></div></div>\n          <div class=\"mk-k\"><div class=\"l\">Carts recovered</div><div class=\"n\" id=\"mk-k-cr\">—</div><div class=\"s\" id=\"mk-k-cr-s\"></div></div>\n        </div>\n        <div class=\"mk-cards\">\n          <div class=\"mk-c\"><div class=\"t\"><span style=\"background:#e0e7ff\">🔔</span>Notifications</div><div class=\"d\">Send a message to all app customers now, or schedule it.</div><div class=\"st\" id=\"mk-st-notif\">…</div><button class=\"btn-primary set-btn\" onclick=\"goSection('notifications')\">+ New notification</button></div>\n          <div class=\"mk-c\"><div class=\"t\"><span style=\"background:#fce7f3\">🎁</span>Referrals</div><div class=\"d\">Customers invite friends and earn credit.</div><div class=\"st\" id=\"mk-st-ref\">…</div><button class=\"btn-primary set-btn\" onclick=\"goSection('referrals')\">Review referrals</button></div>\n          <div class=\"mk-c\"><div class=\"t\"><span style=\"background:#dcfce7\">🛒</span>Cart reminders</div><div class=\"d\">One push to app customers who left items in their cart.</div><div class=\"st\" id=\"mk-st-cr\">…</div><button class=\"tb-btn mk-btn\" onclick=\"goSection('cartrem')\">Open cart reminders</button></div>\n          <div class=\"mk-c\"><div class=\"t\"><span style=\"background:#fce7f3\">🎁</span>Loyalty reminders</div><div class=\"d\">Automatic push to app customers who are one order away from a free delivery, or have one waiting.</div><div class=\"st\" id=\"mk-st-lr\">…</div><button class=\"tb-btn mk-btn\" onclick=\"goSection('loyrem')\">Open loyalty reminders</button></div>\n          <div class=\"mk-c\"><div class=\"t\"><span style=\"background:#ffedd5\">🔥</span>Offers &amp; banners</div><div class=\"d\">Home page slides and offer cards.</div><div class=\"st\" id=\"mk-st-ob\">…</div><div style=\"display:flex;gap:6px;flex-wrap:wrap\"><button class=\"tb-btn mk-btn\" onclick=\"goSection('offers')\">Offers</button><button class=\"tb-btn mk-btn\" onclick=\"goSection('banners')\">Banners</button></div></div>\n          <div class=\"mk-c\"><div class=\"t\"><span style=\"background:#ede9fe\">🔎</span>Customer searches</div><div class=\"d\">Every word customers type in the supermarket search — and what they could not find.</div><div class=\"st\" id=\"mk-st-sr\">…</div><button class=\"tb-btn mk-btn\" onclick=\"goSection('searches')\">Open searches</button></div>\n        </div>", "visitors": "        <div class=\"mk-title\">👥 Visitors &amp; customers</div>\n        <div class=\"mk-sub\">Real people, not page opens. A <b>customer</b> = someone who ordered (by phone number). <b>In your area</b> = their delivery GPS pin is within <span id=\"vi-rad\">8</span> km of Qubbah.</div>\n        <div class=\"sr-top\">\n          <div class=\"sr-seg\" id=\"vi-seg\">\n            <button type=\"button\" data-d=\"1\" onclick=\"viPeriod(1)\">Today</button>\n            <button type=\"button\" data-d=\"7\" onclick=\"viPeriod(7)\">7 days</button>\n            <button type=\"button\" data-d=\"30\" onclick=\"viPeriod(30)\">30 days</button>\n          </div>\n          <button type=\"button\" class=\"tb-btn\" onclick=\"loadVisitors()\"><i class=\"ti ti-refresh\"></i> Refresh</button>\n        </div>\n        <div class=\"vi-note\" id=\"vi-note\" style=\"display:none\"></div>\n        <div class=\"sr-card vi-live\" style=\"max-width:1100px;margin-bottom:12px\"><div class=\"sr-h\"><span class=\"vi-dot\"></span> Live now <span class=\"vi-livet\" id=\"vi-live-t\"></span></div><div class=\"sr-hs\">People in the app at this moment (active in the last 2 minutes) and the page each one is on. Updates every 15 seconds.</div><div id=\"vi-live\"><div class=\"sr-empty\">Loading…</div></div></div>\n        <div class=\"mk-kpis\">\n          <div class=\"mk-k\"><div class=\"l\">📱 People who opened the app</div><div class=\"n\" id=\"vi-k-people\">—</div><div class=\"s\" id=\"vi-k-people-s\" style=\"color:var(--muted)\"></div></div>\n          <div class=\"mk-k\"><div class=\"l\">🛒 Real customers (ordered)</div><div class=\"n\" id=\"vi-k-cust\">—</div><div class=\"s\" id=\"vi-k-cust-s\"></div></div>\n          <div class=\"mk-k\"><div class=\"l\">📍 Customers in your area</div><div class=\"n\" id=\"vi-k-in\" style=\"color:#15803d\">—</div><div class=\"s\" id=\"vi-k-in-s\" style=\"color:var(--muted)\"></div></div>\n          <div class=\"mk-k\"><div class=\"l\">🔁 Came back (2+ orders)</div><div class=\"n\" id=\"vi-k-back\">—</div><div class=\"s\" id=\"vi-k-back-s\" style=\"color:var(--muted)\"></div></div>\n        </div>\n        <div class=\"sr-cols\">\n          <div class=\"sr-card\"><div class=\"sr-h\">Where people stop</div><div class=\"sr-hs\">Out of everyone who opened the app — how far they got. The biggest red drop is where to improve.</div><div id=\"vi-funnel\"><div class=\"sr-empty\">Loading…</div></div></div>\n          <div class=\"sr-card\"><div class=\"sr-h\">Who are the visitors?</div><div class=\"sr-hs\">Different phones in the period.</div><div id=\"vi-who\"><div class=\"sr-empty\">Loading…</div></div></div>\n        </div>\n        <div class=\"sr-card\" style=\"max-width:1100px;margin-bottom:12px\"><div class=\"sr-h\">📄 Most visited pages</div><div class=\"sr-hs\">Different people per page in the period (one person opening a page 5 times counts once; \"opens\" counts every time).</div><div id=\"vi-pages\"><div class=\"sr-empty\">Loading…</div></div></div>\n        <div class=\"sr-card\" style=\"max-width:1100px\"><div class=\"sr-h\">Your real customers</div><div class=\"sr-hs\">Phone shown as last 4 digits · area from the delivery GPS pin · tap a column title to sort.</div><div id=\"vi-list\" style=\"overflow-x:auto\"><div class=\"sr-empty\">Loading…</div></div></div>", "searches": "        <div class=\"mk-title\">🔎 Customer searches</div>\n        <div class=\"mk-sub\">Every word customers type in the supermarket search (app + website). See what they want, what is missing, and add it.</div>\n        <div class=\"sr-top\">\n          <div class=\"sr-seg\" id=\"sr-seg\">\n            <button type=\"button\" data-d=\"1\" onclick=\"srPeriod(1)\">Today</button>\n            <button type=\"button\" data-d=\"7\" onclick=\"srPeriod(7)\">7 days</button>\n            <button type=\"button\" data-d=\"30\" onclick=\"srPeriod(30)\">30 days</button>\n          </div>\n          <button type=\"button\" class=\"tb-btn\" onclick=\"loadSearches()\"><i class=\"ti ti-refresh\"></i> Refresh</button>\n          <span class=\"sr-live\" id=\"sr-live\"><i></i> Live · updates every 30 s</span>\n        </div>\n        <div class=\"mk-kpis\">\n          <div class=\"mk-k\"><div class=\"l\">Searches</div><div class=\"n\" id=\"sr-k-total\">—</div><div class=\"s\" id=\"sr-k-total-s\" style=\"color:var(--muted)\"></div></div>\n          <div class=\"mk-k\"><div class=\"l\">Found nothing</div><div class=\"n\" id=\"sr-k-zero\" style=\"color:#dc2626\">—</div><div class=\"s\" id=\"sr-k-zero-s\" style=\"color:#dc2626\"></div></div>\n          <div class=\"mk-k\"><div class=\"l\">Led to cart 🛒</div><div class=\"n\" id=\"sr-k-cart\" style=\"color:#16a34a\">—</div><div class=\"s\" id=\"sr-k-cart-s\"></div></div>\n          <div class=\"mk-k\"><div class=\"l\">Customers searching</div><div class=\"n\" id=\"sr-k-people\">—</div><div class=\"s\" id=\"sr-k-people-s\" style=\"color:var(--muted)\"></div></div>\n        </div>\n        <div class=\"sr-cols\">\n          <div class=\"sr-card\"><div class=\"sr-h\">❌ Searched but NOT found</div><div class=\"sr-hs\">Customers wanted these and saw nothing. Add the product — or check the spelling in Products.</div><div id=\"sr-nf\"><div class=\"sr-empty\">Loading…</div></div></div>\n          <div class=\"sr-card\"><div class=\"sr-h\">🔥 Top searches</div><div class=\"sr-hs\">Most typed words · average results · how many added to cart.</div><div id=\"sr-top\"><div class=\"sr-empty\">Loading…</div></div></div>\n        </div>\n        <div class=\"sr-card sr-feed\" style=\"max-width:1100px\"><div class=\"sr-h\">⏱ Live — every search</div><div class=\"sr-hs\">Newest first. 📱 app · 🌐 website · customer = last 4 phone digits.</div><div id=\"sr-feed\"><div class=\"sr-empty\">Loading…</div></div></div>", "banners": "        <div class=\"section-header\">\n          <div class=\"section-title\">Hero Banners <span style=\"font-size:12px;color:var(--muted);font-weight:400\">· Homepage slider</span></div>\n          <button class=\"btn-add\" onclick=\"openAddBanner()\"><i class=\"ti ti-plus\" style=\"font-size:14px\"></i> Add banner</button>\n        </div>\n        <div id=\"banners-list\"><div class=\"loading\">Loading...</div></div>", "offers": "        <div class=\"section-header\">\n          <div>\n            <div class=\"section-title\">🔥 Offers <span style=\"font-size:12px;color:var(--muted);font-weight:400\">· «عروض اليوم» on the app home</span></div>\n            <div style=\"font-size:12px;color:var(--muted)\">Deal cards shown at the top of the customer home. Toggle off or delete and it disappears instantly.</div>\n          </div>\n          <button class=\"btn-add\" onclick=\"openOfferModal()\"><i class=\"ti ti-plus\" style=\"font-size:14px\"></i> Add Offer</button>\n        </div>\n        <div id=\"offers-list\"><div class=\"loading\">Loading...</div></div>\n      </div>\n\n      <!-- OFFER MODAL -->\n      <div class=\"modal-backdrop\" id=\"offer-modal\" onclick=\"if(event.target===this)closeOfferModal()\">\n        <div class=\"modal\" style=\"max-width:480px\">\n          <div class=\"modal-head\">\n            <span class=\"modal-title\" id=\"offer-modal-title\"><i class=\"ti ti-discount-2\"></i> New Offer</span>\n            <button class=\"modal-close\" onclick=\"closeOfferModal()\"><i class=\"ti ti-x\"></i></button>\n          </div>\n          <input type=\"hidden\" id=\"offer-edit-id\"/>\n          <div class=\"field\"><label>Title * (العنوان)</label><input type=\"text\" id=\"offer-title\" placeholder=\"مثال: مطعم البيك\"/></div>\n          <div class=\"field\"><label>Subtitle (الوصف)</label><input type=\"text\" id=\"offer-sub\" placeholder=\"مثال: على جميع الوجبات\"/></div>\n          <div class=\"field\"><label>Badge (الشارة) — discount / free delivery</label><input type=\"text\" id=\"offer-badge\" placeholder=\"مثال: ٣٠٪ خصم — أو — توصيل مجاني\"/></div>\n          <div style=\"display:flex;gap:10px\">\n            <div class=\"field\" style=\"flex:1\"><label>Emoji</label><input type=\"text\" id=\"offer-emoji\" placeholder=\"🍔\" maxlength=\"6\"/></div>\n            <div class=\"field\" style=\"flex:1\"><label>Card color</label><select id=\"offer-color\"><option value=\"rose\">🌹 Rose</option><option value=\"green\">🟢 Green</option><option value=\"amber\">🟡 Amber</option></select></div>\n          </div>\n          <div style=\"display:flex;gap:10px\">\n            <div class=\"field\" style=\"flex:1\"><label>Promo code (optional)</label><input type=\"text\" id=\"offer-code\" placeholder=\"FREE1\"/></div>\n            <div class=\"field\" style=\"flex:1\"><label>Expires (optional)</label><input type=\"date\" id=\"offer-expires\"/></div>\n          </div>\n          <div class=\"field\"><label>Button link (optional)</label><input type=\"text\" id=\"offer-link\" placeholder=\"/restaurants\"/></div>\n          <div style=\"display:flex;justify-content:space-between;align-items:center;padding:11px;background:var(--bg);border-radius:8px;margin-bottom:14px\">\n            <div><div style=\"font-size:13px;font-weight:600\">Active</div><div style=\"font-size:11px;color:var(--muted)\">Shows on the customer home</div></div>\n            <label class=\"switch\"><input type=\"checkbox\" id=\"offer-active\" checked><span class=\"slider\"></span></label>\n          </div>\n          <div id=\"offer-err\" style=\"color:var(--rose);font-size:12px;margin-bottom:10px;display:none\"></div>\n          <div style=\"display:flex;gap:8px\">\n            <button class=\"btn-secondary\" onclick=\"closeOfferModal()\" style=\"flex:1\">Cancel</button>\n            <button class=\"btn-primary\" onclick=\"saveOffer()\" style=\"flex:1\"><i class=\"ti ti-check\"></i> Save Offer</button>\n          </div>\n        </div>", "notifications": "        <div class=\"section-header\">\n          <div class=\"section-title\">Push Notifications</div>\n          <button class=\"btn-add\" onclick=\"showNotifPreview()\"><i class=\"ti ti-eye\" style=\"font-size:13px\"></i> Preview</button>\n        </div>\n\n        <!-- ── Analytics dashboard (Phase 1) ── -->\n        <div id=\"notif-dash\" style=\"margin-bottom:16px\"><div class=\"loading\" style=\"padding:20px;text-align:center;color:var(--muted)\">Loading dashboard…</div></div>\n\n        <!-- Firebase setup card removed — setup is one-time & done; a slim status line lives at the bottom, device counts are now in the dashboard above. -->\n\n        <!-- Send notification card -->\n        <div class=\"card\" style=\"margin-bottom:16px\">\n          <div class=\"card-head\"><div class=\"card-title\"><i class=\"ti ti-send\" style=\"font-size:14px;margin-right:4px\"></i> Send Notification</div></div>\n          <div class=\"card-body\">\n            <div class=\"row2\">\n              <div class=\"field\" style=\"margin:0\"><label>Title in Arabic *</label><input type=\"text\" id=\"notif-title-ar\" placeholder=\"عنوان الإشعار\" dir=\"rtl\" style=\"font-family:inherit\" oninput=\"updateNotifLivePreview()\"/></div>\n              <div class=\"field\" style=\"margin:0\"><label>Title in English</label><input type=\"text\" id=\"notif-title-en\" placeholder=\"Notification title\"/></div>\n            </div>\n            <div class=\"row2\" style=\"margin-top:12px\">\n              <div class=\"field\" style=\"margin:0\"><label>Message in Arabic *</label><textarea id=\"notif-body-ar\" placeholder=\"نص الرسالة أو العرض...\" dir=\"rtl\" style=\"font-family:inherit;height:80px\" oninput=\"updateNotifLivePreview()\"></textarea></div>\n              <div class=\"field\" style=\"margin:0\"><label>Message in English</label><textarea id=\"notif-body-en\" placeholder=\"Message or offer text...\" style=\"height:80px\"></textarea></div>\n            </div>\n            <div class=\"row2\" style=\"margin-top:12px\">\n              <div class=\"field\" style=\"margin:0\">\n                <label>Target audience</label>\n                <select id=\"notif-target\" onchange=\"updateNotifLivePreview()\">\n                  <option value=\"all\" id=\"nt-all\">Everyone</option>\n                  <option value=\"ios\" id=\"nt-ios\">iPhone only</option>\n                  <option value=\"android\" id=\"nt-android\">Android only</option>\n                  <option value=\"active\" id=\"nt-active\">Active users · last 7 days</option>\n                  <option value=\"test\" id=\"nt-test\">🧪 Test — my device only (no customers)</option>\n                </select>\n              </div>\n              <div class=\"field\" style=\"margin:0\"><label>Image URL (optional)</label><input type=\"text\" id=\"notif-img\" placeholder=\"https://deliverystep.app/banner.jpg\" oninput=\"updateNotifLivePreview()\"/></div>\n            </div>\n            <!-- Live preview (updates as you type) -->\n            <div style=\"margin-top:14px;background:#eef1f5;border-radius:14px;padding:14px;display:flex;justify-content:center\">\n              <div style=\"width:100%;max-width:320px;background:#fff;border-radius:14px;padding:11px 12px;box-shadow:0 10px 24px -10px rgba(0,0,0,.3);display:flex;gap:10px\">\n                <div style=\"width:34px;height:34px;border-radius:8px;background:var(--rose);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px\">خ</div>\n                <div style=\"flex:1;min-width:0\">\n                  <div style=\"font-size:10.5px;color:#8a94a3;font-weight:700;display:flex;justify-content:space-between\"><span>خطوة التوصيل</span><span>now</span></div>\n                  <div id=\"np-title\" style=\"font-size:13px;font-weight:800;margin:1px 0;direction:rtl;word-break:break-word\">عنوان الإشعار</div>\n                  <div id=\"np-body\" style=\"font-size:12px;color:#3f4655;line-height:1.35;direction:rtl;word-break:break-word\">نص الرسالة</div>\n                  <div id=\"np-img\" style=\"margin-top:6px;display:none\"><img id=\"np-img-el\" alt=\"\" style=\"width:100%;border-radius:8px;max-height:120px;object-fit:cover\"/></div>\n                </div>\n              </div>\n            </div>\n            <div class=\"field\" style=\"margin-top:12px\">\n              <label style=\"display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600\"><input type=\"checkbox\" id=\"notif-schedule-on\" onchange=\"toggleSchedule()\" style=\"width:auto;margin:0\"/> <i class=\"ti ti-clock\" style=\"font-size:14px\"></i> Schedule for later (send at a set date &amp; time)</label>\n              <div style=\"margin-top:8px\"><button type=\"button\" onclick=\"setBestTimeSchedule()\" style=\"background:#fdeef5;color:#9d174d;border:1px solid #f6d6e6;border-radius:9px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer\"><i class=\"ti ti-bolt\" style=\"font-size:13px\"></i> <span id=\"best-time-btn-lbl\">Send at best time</span></button></div>\n              <div id=\"notif-schedule-row\" class=\"row2\" style=\"display:none;margin-top:10px\">\n                <div class=\"field\" style=\"margin:0\"><label>Date</label><input type=\"date\" id=\"notif-sched-date\"/></div>\n                <div class=\"field\" style=\"margin:0\"><label>Time</label><input type=\"time\" id=\"notif-sched-time\"/></div>\n              </div>\n            </div>\n            <div class=\"err-msg\" id=\"notif-err\" style=\"margin-top:10px\"></div>\n            <button class=\"btn-primary\" style=\"margin-top:16px\" id=\"notif-send-btn\" onclick=\"sendPushNotification()\">\n              <i class=\"ti ti-bell-ringing\" style=\"font-size:15px\"></i> Send to all users\n            </button>\n          </div>\n        </div>\n\n        <!-- Quick templates -->\n        <div class=\"card\" style=\"margin-bottom:16px\">\n          <div class=\"card-head\"><div class=\"card-title\"><i class=\"ti ti-template\" style=\"font-size:14px;margin-right:4px\"></i> Quick Templates</div></div>\n          <div class=\"card-body\">\n            <div style=\"display:flex;flex-wrap:wrap;gap:8px\">\n              <button class=\"btn-add\" onclick=\"useTemplate('offer')\">🎉 Special Offer</button>\n              <button class=\"btn-add\" onclick=\"useTemplate('free')\">🆓 Free Delivery</button>\n              <button class=\"btn-add\" onclick=\"useTemplate('new')\">🆕 New Restaurant</button>\n              <button class=\"btn-add\" onclick=\"useTemplate('ramadan')\">🌙 Ramadan Offer</button>\n              <button class=\"btn-add\" onclick=\"useTemplate('weekend')\">🎊 Weekend Deal</button>\n            </div>\n          </div>\n        </div>\n\n        <!-- History -->\n        <div class=\"card\">\n          <div class=\"card-head\">\n            <div class=\"card-title\"><i class=\"ti ti-history\" style=\"font-size:14px;margin-right:4px\"></i> Sent Notifications</div>\n            <button class=\"btn-add\" onclick=\"loadNotifHistory()\"><i class=\"ti ti-refresh\" style=\"font-size:13px\"></i> Refresh</button>\n          </div>\n          <div class=\"card-body\" id=\"notif-history\"><div class=\"loading\">Loading...</div></div>\n        </div>\n\n        <!-- slim service status + collapsible setup help -->\n        <div style=\"text-align:center;font-size:11.5px;color:var(--muted);margin-top:14px\">\n          <span id=\"fcm-status\"><i class=\"ti ti-loader\" style=\"font-size:12px\"></i> Checking…</span>\n          &nbsp;·&nbsp;<a onclick=\"testFcmConnection()\" style=\"color:var(--rose);cursor:pointer;font-weight:600\">Test connection</a>\n          &nbsp;·&nbsp;<a onclick=\"var w=document.getElementById('fcm-setup-help');if(w)w.style.display=(w.style.display==='none'?'block':'none')\" style=\"color:var(--muted);cursor:pointer;font-weight:600\">Setup help</a>\n        </div>\n        <div id=\"fcm-setup-help\" style=\"display:none;margin-top:10px;font-size:12px;background:var(--amber-bg);color:var(--amber-text);padding:10px 12px;border-radius:8px\">\n          <strong>One-time setup (already done):</strong> Firebase Console → Project Settings → Service accounts → <strong>Generate new private key</strong> → open <code>notify.php</code> and paste the JSON inside → upload <code>notify.php</code> to Hostinger.\n        </div>", "loyrem": "        <div class=\"mk-title\">🎁 Loyalty reminders</div>\n        <div class=\"mk-sub\">Automatic push to app customers: <b>one order away</b> from the free delivery (9 of 10), <b>just earned it</b> (10 of 10), or <b>not used after 7 days</b>. Max 1 reminder a week per customer, only between 12 PM and 9 PM.</div>\n        <div style=\"max-width:1100px\">\n          <div class=\"set-card\">\n            <div class=\"cr-head\">\n              <div class=\"set-h\" style=\"margin:0\"><i class=\"ti ti-gift\"></i> Loyalty card reminders — تذكير بطاقة الولاء</div>\n              <label class=\"cr-switch\" title=\"Turn loyalty reminders on / off\"><input type=\"checkbox\" id=\"lr-on\" onchange=\"lrToggle(this)\"/><span></span></label>\n            </div>\n            <div class=\"set-state\" id=\"lr-state\">…</div>\n            <div class=\"mk-kpis\" style=\"margin-top:12px\">\n              <div class=\"mk-k\"><div class=\"l\">🎁 Free delivery waiting</div><div class=\"n\" id=\"lr-k-free\">—</div><div class=\"s\" id=\"lr-k-free-s\"></div></div>\n              <div class=\"mk-k\"><div class=\"l\">🎯 One order away</div><div class=\"n\" id=\"lr-k-one\">—</div><div class=\"s\" id=\"lr-k-one-s\"></div></div>\n              <div class=\"mk-k\"><div class=\"l\">📨 Sent this week</div><div class=\"n\" id=\"lr-k-week\">—</div><div class=\"s\">max 1 per customer a week</div></div>\n              <div class=\"mk-k\"><div class=\"l\">🛒 Ordered after (30 days)</div><div class=\"n\" id=\"lr-k-ord\">—</div><div class=\"s\" id=\"lr-k-ord-s\"></div></div>\n            </div>\n            <div class=\"set-h\" style=\"margin-top:6px;font-size:13px\">How each message works — last 30 days</div>\n            <div style=\"overflow-x:auto\"><table class=\"lr-kinds\" id=\"lr-kinds\"></table></div>\n            <div style=\"font-size:11.5px;color:var(--muted);margin:6px 0 14px\">Tapped = opened the app from the reminder. Ordered = the same customer ordered within 3 days after it (some might have ordered anyway).</div>\n            <div class=\"set-h\" style=\"font-size:13px\">The messages — tap to edit</div>\n            <div id=\"lr-texts\"></div>\n            <div style=\"display:flex;gap:8px;flex-wrap:wrap;align-items:center\">\n              <button class=\"btn-primary set-btn\" onclick=\"lrSaveTexts()\">💾 Save messages</button>\n              <button class=\"tb-btn mk-btn\" onclick=\"lrSendNow()\">📣 Send to the waiting customers now</button>\n              <span class=\"set-msg\" id=\"lr-out\"></span>\n            </div>\n          </div>\n          <div class=\"set-card\" style=\"margin-top:14px\">\n            <div class=\"set-h\" style=\"font-size:13px\">👥 Waiting customers <span style=\"font-weight:600;color:var(--muted);font-size:12px\">(ordered in the last 180 days)</span></div>\n            <div style=\"font-size:11.5px;color:var(--muted);margin-bottom:8px\">📱 = gets the app reminder by itself. 💬 = ordered only from the website — remind them on WhatsApp if you like.</div>\n            <div style=\"overflow-x:auto\"><table class=\"lr-list\" id=\"lr-list\"><tr><td>Loading…</td></tr></table></div>\n          </div>\n        </div>", "cartrem": "        <div class=\"mk-title\">🛒 Cart reminders</div><div class=\"mk-sub\">One push notification to app customers who left products in their cart.</div>\n        <div style=\"max-width:1100px\">\n          <div class=\"set-card cr-card\" id=\"set-cr-card\">\n            <div class=\"cr-head\">\n              <div class=\"set-h\" style=\"margin:0\"><i class=\"ti ti-shopping-cart\"></i> Cart reminders — تذكير السلة <span class=\"cr-new\">NEW</span></div>\n              <label class=\"cr-switch\" title=\"Turn cart reminders on / off\"><input type=\"checkbox\" id=\"cr-on\" onchange=\"crToggle(this)\"/><span></span></label>\n            </div>\n            <div class=\"set-state\" id=\"cr-state\">…</div>\n            <div class=\"cr-cols\">\n              <div class=\"cr-left\">\n                <div class=\"cr-step\"><b>1</b> When to send the reminder</div>\n                <div class=\"cr-seg\" id=\"cr-after\">\n                  <button type=\"button\" data-v=\"30\" onclick=\"crAfter(30)\">30 min</button>\n                  <button type=\"button\" data-v=\"60\" onclick=\"crAfter(60)\">1 hour</button>\n                  <button type=\"button\" data-v=\"180\" onclick=\"crAfter(180)\">3 hours</button>\n                </div>\n                <div class=\"set-hint\" style=\"margin-top:6px\">…after the customer last touched their cart without ordering.</div>\n                <div class=\"cr-step\"><b>2</b> Which carts</div>\n                <div class=\"field\" style=\"max-width:260px\"><label>Only carts of at least (SAR) — 0 = every cart</label><input type=\"number\" id=\"cr-min\" min=\"0\" step=\"1\" placeholder=\"15\"/></div>\n                <div class=\"cr-step\"><b>3</b> The message — الرسالة</div>\n                <textarea id=\"cr-msg\" rows=\"2\" maxlength=\"180\" oninput=\"crPreview()\" style=\"direction:rtl;font-family:'Tajawal',sans-serif;width:100%;min-height:64px;line-height:1.6\"></textarea>\n                <div class=\"cr-tags\">Tap to add:\n                  <button type=\"button\" onclick=\"crTag('cr-msg','{items}')\">عدد الأصناف</button>\n                  <button type=\"button\" onclick=\"crTag('cr-msg','{shop}')\">اسم المتجر</button>\n                  <button type=\"button\" onclick=\"crTag('cr-msg','{total}')\">المبلغ</button>\n                </div>\n                <label class=\"set-check\" style=\"margin-top:12px\"><input type=\"checkbox\" id=\"cr-second\" onchange=\"crSecondUi();crPreview()\"/> Second reminder the next day, if they still didn't order</label>\n                <div id=\"cr-second-box\" style=\"display:none\">\n                  <textarea id=\"cr-msg2\" rows=\"2\" maxlength=\"180\" oninput=\"crPreview()\" style=\"direction:rtl;font-family:'Tajawal',sans-serif;width:100%;min-height:64px;line-height:1.6\"></textarea>\n                  <div class=\"set-hint\" style=\"margin-top:4px\">Tip: you can mention an offer here, e.g. a free-delivery coupon.</div>\n                </div>\n                <button class=\"btn-primary set-btn\" onclick=\"crSave()\"><i class=\"ti ti-device-floppy\" style=\"font-size:14px\"></i> Save</button>\n                <div class=\"set-msg\" id=\"cr-out\"></div>\n              </div>\n              <div class=\"cr-right\">\n                <div class=\"cr-lbl\">What the customer sees</div>\n                <div class=\"cr-phone\"><div class=\"cr-nt\" id=\"cr-pv1\"></div><div class=\"cr-nt cr-nt2\" id=\"cr-pv2\" style=\"display:none\"></div></div>\n                <div class=\"cr-lbl\">Send a test to your phone</div>\n                <div class=\"cr-test\"><input id=\"cr-test-phone\" inputmode=\"tel\" placeholder=\"05xxxxxxxx\"/><button type=\"button\" class=\"tb-btn\" onclick=\"crTest()\">📲 Send test</button></div>\n                <div class=\"set-hint\" style=\"margin-top:6px\">Use your number — it must have ordered once from the app on that phone.</div>\n                <div class=\"set-msg\" id=\"cr-test-out\" style=\"margin-top:0\"></div>\n                <div class=\"cr-lbl\">Last 30 days</div>\n                <div class=\"cr-stats\" id=\"cr-stats\"></div>\n                <div class=\"set-hint\" id=\"cr-stats-note\" style=\"margin-top:6px\"></div>\n              </div>\n            </div>\n            <div class=\"cr-rules\"><span>✔ One reminder per cart</span><span>✔ Never at night (12 am – 9 am)</span><span>✔ Not sent if they already ordered</span><span>✔ Only app customers with notifications on</span></div>\n          </div>\n        </div>", "referrals": "        <style>\n          #section-referrals .rf-top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px}\n          #section-referrals .rf-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}\n          #section-referrals .rf-seg{display:flex;background:var(--white,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:3px}\n          #section-referrals .rf-seg button{height:32px;padding:0 12px;border:none;border-radius:8px;background:transparent;color:var(--muted,#64748b);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}\n          #section-referrals .rf-seg button.on{background:var(--text,#0f172a);color:var(--white,#fff)}\n          #section-referrals .rf-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px}\n          #section-referrals .rf-kpi{background:var(--white,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:12px 14px}\n          #section-referrals .rf-kpi.amber{background:#fffbeb;border-color:#fde68a}\n          #section-referrals .rf-kpi .l{font-size:12px;color:var(--muted,#64748b);font-weight:600}\n          #section-referrals .rf-kpi .n{font-size:24px;font-weight:700;margin-top:2px;color:var(--text,#0f172a)}\n          #section-referrals .rf-kpi.amber .n{color:#b45309}\n          #section-referrals .rf-kpi .n.g{color:#16a34a}\n          #section-referrals .rf-kpi .s{font-size:11.5px;color:var(--muted,#64748b)}\n          #section-referrals .rf-alert{background:#fef2f2;border:1px solid #fecaca;color:#7f1d1d;border-radius:12px;padding:10px 14px;font-size:13px;line-height:1.6;margin-bottom:14px}\n          #section-referrals .rf-row{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;margin-bottom:14px}\n          #section-referrals .rf-card{background:var(--white,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:14px;margin-bottom:14px}\n          #section-referrals .rf-row .rf-card{margin-bottom:0}\n          #section-referrals .rf-grow{flex:999 1 520px;min-width:0}\n          #section-referrals .rf-side{flex:1 1 260px;min-width:0}\n          #section-referrals .rf-h{font-size:14px;font-weight:700;margin-bottom:10px;color:var(--text,#0f172a)}\n          #section-referrals .rf-h small{font-weight:600;color:var(--muted,#64748b)}\n          #section-referrals .rf-p{border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:12px;margin-bottom:10px}\n          #section-referrals .rf-p.ok{border-color:#bbf7d0}\n          #section-referrals .rf-p.bad{border-color:#fecaca}\n          #section-referrals .rf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}\n          #section-referrals .rf-grid div{display:flex;flex-direction:column;gap:1px;font-size:13.5px;font-weight:700}\n          #section-referrals .rf-grid span{font-size:11.5px;font-weight:600;color:var(--muted,#64748b)}\n          #section-referrals .rf-warn{font-size:12px;border-radius:8px;padding:6px 10px;margin-top:8px}\n          #section-referrals .rf-act{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px;padding-top:10px;border-top:1px dashed var(--border,#e2e8f0)}\n          #section-referrals .rf-act input,#section-referrals .rf-set input{width:72px;height:38px;border:1.5px solid var(--border,#e2e8f0);border-radius:8px;text-align:center;font:inherit;font-weight:700;background:var(--white,#fff);color:var(--text,#0f172a)}\n          #section-referrals .rf-btn{height:38px;padding:0 14px;border:none;border-radius:8px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}\n          #section-referrals .rf-btn.ok{background:#16a34a;color:#fff;flex:1}\n          #section-referrals .rf-btn.no{background:#fee2e2;color:#991b1b}\n          #section-referrals .rf-btn.rose{background:#be185d;color:#fff;width:100%}\n          #section-referrals .rf-set{display:flex;flex-direction:column;gap:10px;font-size:13px}\n          #section-referrals .rf-set .line{display:flex;align-items:center;justify-content:space-between;gap:8px}\n          #section-referrals .rf-tbl{overflow-x:auto}\n          #section-referrals table{width:100%;border-collapse:collapse;font-size:13px}\n          #section-referrals th{text-align:left;font-size:11.5px;color:var(--muted,#64748b);font-weight:600;padding:8px}\n          #section-referrals td{padding:9px 8px;border-top:1px solid var(--border,#e2e8f0);white-space:nowrap}\n          #section-referrals tr.dup td{background:rgba(254,226,226,.35)}\n          #section-referrals .st{font-size:11px;font-weight:700;padding:3px 9px;border-radius:10px}\n          #section-referrals .st.ok{background:#dcfce7;color:#166534}\n          #section-referrals .st.wait{background:#fef3c7;color:#92400e}\n          #section-referrals .st.no{background:#fee2e2;color:#991b1b}\n          #section-referrals .tag{margin-left:6px;font-size:10.5px;font-weight:700;background:#fee2e2;color:#991b1b;padding:2px 7px;border-radius:8px}\n          #section-referrals .rf-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-bottom:10px}\n          #section-referrals .rf-chips{display:flex;flex-wrap:wrap;gap:6px}\n          #section-referrals .rf-chips button{height:32px;padding:0 12px;border-radius:16px;border:1.5px solid var(--border,#e2e8f0);background:var(--white,#fff);color:var(--text,#0f172a);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}\n          #section-referrals .rf-chips button.on{background:#be185d;border-color:#be185d;color:#fff}\n          #section-referrals #rf-q{height:34px;width:220px;border:1.5px solid var(--border,#e2e8f0);border-radius:8px;padding:0 10px;font:inherit;font-size:13px;background:var(--white,#fff);color:var(--text,#0f172a)}\n          #section-referrals .rf-empty{color:var(--muted,#64748b);font-size:13px;padding:16px;text-align:center}\n        </style>\n        <div class=\"rf-top\">\n          <div><h2 style=\"font-size:18px;font-weight:600\">🎁 Referrals — الدعوات والمكافآت</h2><div style=\"font-size:12px;color:var(--muted,#64748b)\">Every invite in one place: link opens, friends' orders, rewards paid and credit used.</div></div>\n          <div class=\"rf-tools\">\n            <div class=\"rf-seg\" id=\"rf-period\">\n              <button class=\"on\" data-p=\"all\">All time</button><button data-p=\"30\">30 days</button><button data-p=\"7\">7 days</button>\n            </div>\n            <button class=\"btn-add\" onclick=\"loadReferralsAdmin()\"><i class=\"ti ti-refresh\" style=\"font-size:13px\"></i> Refresh</button>\n          </div>\n        </div>\n        <div class=\"rf-kpis\" id=\"rf-kpis\"><div class=\"rf-empty\">Loading…</div></div>\n        <div id=\"rf-alert\"></div>\n        <div class=\"rf-row\">\n          <div class=\"rf-card rf-grow\">\n            <div class=\"rf-h\">⏳ Waiting for your approval <small>· بانتظار الموافقة</small></div>\n            <div id=\"rf-pending\"><div class=\"rf-empty\">Loading…</div></div>\n          </div>\n          <div class=\"rf-card rf-side\">\n            <div class=\"rf-h\">⚙️ Reward settings</div>\n            <div class=\"rf-set\">\n              <div class=\"line\"><label for=\"rf-reward-set\" style=\"font-weight:600\">Reward per friend</label><span><input type=\"number\" id=\"rf-reward-set\" min=\"0\" max=\"100\" step=\"0.5\" value=\"2\"/> SAR</span></div>\n              <div class=\"line\"><span style=\"font-weight:600\">Friend's gift</span><span style=\"color:var(--muted,#64748b)\">Free delivery, first order</span></div>\n              <div style=\"font-size:12px;color:var(--muted,#64748b)\">Customers see this amount on the invite page. It is also filled in when you approve.</div>\n              <button class=\"rf-btn rose\" onclick=\"saveRefReward()\">Save</button>\n            </div>\n          </div>\n        </div>\n        <div class=\"rf-card\">\n          <div class=\"rf-h\">🏆 Top inviters <small>· أكثر العملاء دعوةً</small></div>\n          <div class=\"rf-tbl\" id=\"rf-top\"></div>\n        </div>\n        <div class=\"rf-card\">\n          <div class=\"rf-filters\">\n            <div class=\"rf-h\" style=\"margin:0\">📜 All referrals <small>· كل الدعوات</small></div>\n            <div style=\"display:flex;gap:8px;flex-wrap:wrap;align-items:center\">\n              <div class=\"rf-chips\" id=\"rf-chips\"></div>\n              <input id=\"rf-q\" type=\"search\" placeholder=\"Search phone or order #\" aria-label=\"Search referrals\"/>\n            </div>\n          </div>\n          <div class=\"rf-tbl\" id=\"rf-all\"></div>\n        </div>"};
  Object.keys(S).forEach(function(k){ var el=document.getElementById('section-'+k); if(el) el.innerHTML=S[k]; });
})();

// Marketing overview: last 30 days at a glance (each part loads on its own; a failure just shows "—")
/* ── Customer searches (search_log via admin_search_stats) ── */
var SR={days:1,timer:null,data:null,busy:false};
function srPeriod(d){ SR.days=d; loadSearches(); }
function _srStop(){ if(SR.timer){ clearInterval(SR.timer); SR.timer=null; } }
function _srAgo(t){ var s=Math.max(0,(Date.now()-new Date(t).getTime())/1000); if(s<60)return 'now'; if(s<3600)return Math.floor(s/60)+' min'; if(s<86400)return Math.floor(s/3600)+' h';
  return new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'Asia/Riyadh'}); }
function _srTime(t){ return new Date(t).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Riyadh'}); }
function _srPct(a,b){ return b?Math.round(a*100/b)+'%':'0%'; }
async function loadSearches(quiet){
  document.querySelectorAll('#sr-seg button').forEach(function(b){ b.classList.toggle('on',Number(b.dataset.d)===SR.days); });
  if(!SR.timer) SR.timer=setInterval(function(){ var sec=document.getElementById('section-searches'); if(!sec||!sec.classList.contains('active')){ _srStop(); return; } if(document.visibilityState==='visible') loadSearches(true); },30000);
  if(SR.busy) return; SR.busy=true;
  var r; try{ r=await sb.rpc('admin_search_stats',{p_days:SR.days}); }catch(e){ r={error:e}; }
  SR.busy=false;
  if(!r||r.error||!r.data){ if(!quiet){ ['sr-nf','sr-top','sr-feed'].forEach(function(id){ document.getElementById(id).innerHTML='<div class="sr-empty">Could not load searches — '+escHtml((r&&r.error&&r.error.message)||'try again')+'</div>'; }); } return; }
  SR.data=r.data; renderSearches();
}
function renderSearches(){
  var d=SR.data||{}, n=function(x){ return Number(x||0).toLocaleString('en'); }, tot=Number(d.total||0), per=SR.days===1?'today':'in '+SR.days+' days';
  document.getElementById('sr-k-total').textContent=n(tot); document.getElementById('sr-k-total-s').textContent=per;
  document.getElementById('sr-k-zero').textContent=n(d.zero); document.getElementById('sr-k-zero-s').textContent=_srPct(d.zero,tot)+' of searches';
  document.getElementById('sr-k-cart').textContent=n(d.cart); document.getElementById('sr-k-cart-s').textContent=_srPct(d.cart,tot)+' of searches';
  document.getElementById('sr-k-people').textContent=n(d.people); document.getElementById('sr-k-people-s').textContent=per;
  var bd=document.getElementById('sr-badge'); if(bd){ var nf=(d.not_found||[]).length; bd.textContent=nf; bd.style.display=SR.days===1&&nf?'':'none'; }
  var NF=d.not_found||[];
  document.getElementById('sr-nf').innerHTML=NF.length?NF.map(function(x,i){ return '<div class="sr-row"><span class="sr-q" dir="auto" title="'+escHtml(x.q)+'">'+escHtml(x.q)+'</span><span class="sr-n sr-zero">'+n(x.n)+'×</span><span class="sr-m">'+_srAgo(x.last)+'</span>'+
    '<button type="button" class="sr-b" onclick="srCheck('+i+')" title="Search this word in Products">🔍 Check</button><button type="button" class="sr-b add" onclick="srAdd('+i+')">+ Add</button></div>'; }).join('')
    :'<div class="sr-empty">🎉 Nothing missing — every search found products.</div>';
  var TP=d.top||[], mx=TP.reduce(function(a,x){ return Math.max(a,Number(x.n)||0); },1);
  document.getElementById('sr-top').innerHTML=TP.length?TP.map(function(x,i){ return '<div class="sr-row"><span class="sr-m" style="width:18px">'+(i+1)+'</span><div style="flex:1;min-width:0"><div class="sr-q" dir="auto">'+escHtml(x.q)+'</div><div class="sr-bar"><i style="width:'+Math.max(4,Math.round((Number(x.n)||0)*100/mx))+'%"></i></div></div>'+
    '<span class="sr-n">'+n(x.n)+'×</span><span class="sr-m" title="Average products found">'+(Number(x.avg_results)?n(x.avg_results)+' found':'<b style="color:#dc2626">0 found</b>')+'</span>'+(Number(x.carts)?'<span class="sr-cart" title="Added to cart">🛒'+n(x.carts)+'</span>':'')+'</div>'; }).join('')
    :'<div class="sr-empty">No searches yet '+per+'.</div>';
  var RC=d.recent||[];
  document.getElementById('sr-feed').innerHTML=RC.length?RC.map(function(x){ return '<div class="sr-row"><span class="sr-t" title="'+_srTime(x.created_at)+'">'+_srAgo(x.created_at)+'</span><div style="flex:1;min-width:0"><div class="sr-q" dir="auto">'+escHtml(x.q)+'</div>'+
    '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:3px"><span class="sr-tag'+(Number(x.results)?'':' sr-zero')+'">'+(Number(x.results)?n(x.results)+' found':'0 found')+'</span><span class="sr-tag">'+(x.source==='category'?'📂 '+escHtml(x.cat||'category'):'🔎 Search')+'</span>'+
    '<span class="sr-tag">'+(x.device==='app'?'📱 app':'🌐 web')+'</span>'+(x.phone4?'<span class="sr-tag" dir="ltr">••'+escHtml(x.phone4)+'</span>':'')+(x.added_to_cart?'<span class="sr-tag" style="background:#dcfce7;color:#166534">🛒 added</span>':'')+'</div></div></div>'; }).join('')
    :'<div class="sr-empty">No searches yet '+per+'. They appear here a few seconds after a customer types.</div>';
}
/* ── Visitors & customers (visit_days + orders, via admin_visitor_stats) ── */
var VI={days:7,data:null,sort:'n',pages:null,liveT:null};
var VI_PAGE={home:'🏠 Home',restaurants:'🍽️ Restaurants',coffee:'☕ Coffee & sweets',supermarket:'🛒 Supermarket',marketproducts:'🛒 Supermarket category',menu:'📋 Restaurant menu',cart:'🧺 Cart',checkout:'🧾 Checkout',account:'👤 Account',invite:'🎁 Invite friends',pharmacy:'💊 Pharmacy',buffet:'🥘 Buffets',parcel:'📦 Send a parcel','order-tracking':'🛵 Order tracking','order-confirmed':'✅ Order confirmed',other:'Other'};
function _viPg(p){ return VI_PAGE[p]||escHtml(p); }
function _viLiveStop(){ if(VI.liveT){ clearInterval(VI.liveT); VI.liveT=null; } }
async function loadLive(){
  var r; try{ r=await sb.rpc('admin_live'); }catch(e){ r={error:e}; }
  var el=document.getElementById('vi-live'); if(!el) return;
  if(!r||r.error||!r.data){ el.innerHTML='<div class="sr-empty">Could not load — '+escHtml((r&&r.error&&r.error.message)||'try again')+'</div>'; return; }
  var d=r.data, n=Number(d.now||0), a=d.app||{};
  document.getElementById('vi-live-t').textContent='· updated '+new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'Asia/Riyadh'});
  el.innerHTML='<div class="vi-lv"><div><div class="vi-big">'+n+'</div><div style="font-size:12px;color:var(--muted);margin-top:4px">'+(n===1?'person':'people')+' in the app now</div>'+
    (n?'<div style="font-size:11.5px;color:var(--muted);margin-top:6px">📱 '+(a.ios||0)+' · 🤖 '+(a.android||0)+' · 🌐 '+(a.web||0)+'</div>':'')+'</div>'+
    '<div class="vi-chips">'+((d.pages||[]).map(function(x){ var lbl=_viPg(x.page)+(x.page==='menu'&&x.shop?': <bdi>'+escHtml(x.shop)+'</bdi>':x.page==='marketproducts'&&x.ref?': <bdi>'+escHtml(x.ref)+'</bdi>':''); return '<span class="vi-chip">'+lbl+' <b class="vi-cn">'+x.n+'</b></span>'; }).join('')||'<span class="sr-empty" style="padding:6px 0">Nobody in the app right now.</span>')+'</div></div>';
}
async function loadPages(){
  var r; try{ r=await sb.rpc('admin_page_stats',{p_days:VI.days}); }catch(e){ r={error:e}; }
  var el=document.getElementById('vi-pages'); if(!el) return;
  if(!r||r.error||!r.data){ el.innerHTML='<div class="sr-empty">Could not load — '+escHtml((r&&r.error&&r.error.message)||'try again')+'</div>'; return; }
  var d=r.data, P=d.pages||[], M=d.menus||[], C=d.cats||[], H=d.hours||{}, n=function(x){ return Number(x||0).toLocaleString('en'); };
  if(!P.length){ el.innerHTML='<div class="sr-empty">No page visits counted yet'+(VI.days===1?' today':' in this period')+'. They appear here a few seconds after someone opens a page (once the updated pages are uploaded).</div>'; return; }
  var mx=Math.max.apply(null,P.map(function(x){ return x.people; }).concat([1]));
  var row=function(label,people,opens,max){ return '<div class="vi-pr"><span><bdi>'+label+'</bdi></span><div class="vi-bar"><i style="width:'+Math.max(3,Math.round(people*100/max))+'%"></i></div><b>'+n(people)+'</b><em>'+n(opens)+' opens</em></div>'; };
  var hmax=Math.max.apply(null,Object.keys(H).map(function(k){ return H[k]; }).concat([1]));
  var hrs=''; for(var h=0;h<24;h++){ var v=H[h]||0; hrs+='<i class="'+(v>=hmax*0.75?'pk':'')+'" title="'+h+':00 — '+v+' people" style="height:'+Math.max(3,Math.round(v*100/hmax))+'%"></i>'; }
  el.innerHTML='<div class="vi-pg"><div><h4>Pages</h4>'+P.map(function(x){ return row(_viPg(x.page),x.people,x.opens,mx); }).join('')+'</div>'+
    '<div><h4>📋 Most viewed menus</h4>'+(M.length?M.slice(0,8).map(function(x){ return row(escHtml(x.name||'—'),x.people,x.opens,M[0].people||1); }).join(''):'<div class="sr-empty" style="padding:6px 0">—</div>')+
      '<h4 style="margin-top:12px">🛒 Most viewed supermarket categories</h4>'+(C.length?C.slice(0,6).map(function(x){ return row(escHtml(x.cat),x.people,x.opens,C[0].people||1); }).join(''):'<div class="sr-empty" style="padding:6px 0">—</div>')+'</div>'+
    '<div><h4>🕒 When people are in the app</h4><div class="vi-hrs">'+hrs+'</div><div class="vi-hl"><span>12 am</span><span>6 am</span><span>12 pm</span><span>6 pm</span><span>11 pm</span></div>'+
      '<div style="font-size:11.5px;color:var(--muted);margin-top:8px">Dark bars = busiest hours (Riyadh time). '+n(d.opens)+' page opens in the period.</div></div></div>';
}
function viPeriod(d){ VI.days=d; loadVisitors(); }
async function loadVisitors(){
  loadLive(); _viLiveStop(); VI.liveT=setInterval(function(){ var sec=document.getElementById('section-visitors'); if(!sec||!sec.classList.contains('active')){ _viLiveStop(); return; } if(document.visibilityState==='visible') loadLive(); },15000);
  document.querySelectorAll('#vi-seg button').forEach(function(b){ b.classList.toggle('on',Number(b.dataset.d)===VI.days); });
  var r; try{ r=await sb.rpc('admin_visitor_stats',{p_days:VI.days}); }catch(e){ r={error:e}; }
  if(!r||r.error||!r.data){ ['vi-funnel','vi-who','vi-list'].forEach(function(id){ document.getElementById(id).innerHTML='<div class="sr-empty">Could not load — '+escHtml((r&&r.error&&r.error.message)||'try again')+'</div>'; }); return; }
  VI.data=r.data; renderVisitors(); loadPages();
}
function _viPct(a,b){ return b?Math.round(a*100/b)+'%':'0%'; }
function renderVisitors(){
  var d=VI.data||{}, n=function(x){ return Number(x||0).toLocaleString('en'); }, per=VI.days===1?'today':'in '+VI.days+' days';
  document.getElementById('vi-rad').textContent=d.radius_km||8;
  var since=d.tracking_since, note=document.getElementById('vi-note');
  var partial=!since||since>d.from;
  note.style.display=partial?'':'none';
  note.innerHTML=!since?'ℹ️ Visitor counting starts as soon as the updated pages are uploaded. Customer numbers below already use all your orders.'
    :'ℹ️ Visitor counting started on <b>'+since+'</b> — visitor numbers cover only the days since then. Customer numbers use all your orders.';
  document.getElementById('vi-k-people').textContent=since?n(d.people):'—';
  document.getElementById('vi-k-people-s').textContent=since?('different phones '+per+(VI.days>1&&d.people_per_day?' · ≈ '+n(d.people_per_day)+' a day':'')):'starts after upload';
  document.getElementById('vi-k-cust').textContent=n(d.customers);
  document.getElementById('vi-k-cust-s').innerHTML='<b style="color:#15803d">'+n(d.new_customers)+' new</b> · '+n(Math.max(0,(d.customers||0)-(d.new_customers||0)))+' from before · '+n(d.orders)+' orders';
  document.getElementById('vi-k-in').innerHTML=n(d.inside)+' <small style="font-size:13px">('+_viPct(d.inside,d.customers)+')</small>';
  document.getElementById('vi-k-in-s').innerHTML='<b style="color:#b91c1c">'+n(d.outside)+' outside</b> · <b style="color:#c2410c">'+n(d.no_pin)+' no location pin</b>';
  document.getElementById('vi-k-back').innerHTML=n(d.came_back)+' <small style="font-size:13px">('+_viPct(d.came_back,d.customers)+')</small>';
  document.getElementById('vi-k-back-s').textContent='ordered 2+ times '+per;
  // funnel
  var f=d.funnel||{}, steps=[['📱 Opened the app','opened'],['🍽️ Opened a shop','shop'],['➕ Added to cart','cart'],['🧾 Reached checkout','checkout'],['✅ Ordered','ordered']], top=f.opened||0;
  document.getElementById('vi-funnel').innerHTML=!top?'<div class="sr-empty">No visitors counted yet '+per+'. They appear here a few seconds after someone opens the app (once the updated pages are uploaded).</div>':
    steps.map(function(s,i){ var v=f[s[1]]||0, prev=i?(f[steps[i-1][1]]||0):v, drop=prev-v;
      return '<div class="vi-f"><span>'+s[0]+'</span><div class="vi-bar"><i class="'+(s[1]==='ordered'?'ok':'')+'" style="width:'+Math.max(2,Math.round(v*100/top))+'%"></i><em>'+n(v)+' · '+_viPct(v,top)+'</em></div><div class="vi-drop">'+(i&&drop>0?'−'+n(drop)+' left':'')+'</div></div>'; }).join('');
  // who
  var k=d.kind||{}, app=d.app||{}, src=d.src||{}, tot=d.people||0;
  var SRC={google:'Google',instagram:'Instagram',whatsapp:'WhatsApp',snapchat:'Snapchat',tiktok:'TikTok',facebook:'Facebook',twitter:'X / Twitter',bing:'Bing',other:'other sites',direct:'typed / bookmark'};
  var srcRows=Object.keys(src).sort(function(a,b){ return src[b]-src[a]; }).map(function(s){ return (SRC[s]||escHtml(s))+' <b>'+n(src[s])+'</b>'; }).join(' · ');
  document.getElementById('vi-who').innerHTML=!tot?'<div class="sr-empty">No visitors counted yet '+per+'.</div>':
    '<div class="vi-row"><i class="vi-sw" style="background:#be185d"></i><b>'+n(k.customers)+'</b> already customers (ordered before) · '+_viPct(k.customers,tot)+'</div>'+
    '<div class="vi-row"><i class="vi-sw" style="background:#f9a8d4"></i><b>'+n(k.new_people)+'</b> new — never ordered before · '+_viPct(k.new_people,tot)+'</div>'+
    '<div style="margin-top:12px;font-size:12.5px">📱 iPhone app <b>'+n(app.ios)+'</b> · 🤖 Android app <b>'+n(app.android)+'</b> · 🌐 Website <b>'+n(app.web)+'</b></div>'+
    (srcRows?'<div style="margin-top:8px;font-size:12px;color:var(--muted)">Website visitors came from: '+srcRows+'</div>':'');
  renderVisitorList();
}
function _viAgo(t){ var a=_srAgo(t); return a==='now'?'just now':/ (min|h)$/.test(a)?a+' ago':a; }
function viSort(k){ VI.sort=k; renderVisitorList(); }
function renderVisitorList(){
  var L=((VI.data||{}).list||[]).slice(), k=VI.sort;
  L.sort(function(a,b){ return k==='spent'?(b.spent-a.spent):k==='last'?(new Date(b.last_o)-new Date(a.last_o)):(b.n-a.n||b.spent-a.spent); });
  var th=function(key,label){ return '<th class="'+(VI.sort===key?'on':'')+'"'+(key?' onclick="viSort(\''+key+'\')"':'')+'>'+label+(VI.sort===key?' ↓':'')+'</th>'; };
  var area=function(x){ return x.area==='in'?'<span class="vi-p in">📍 inside · '+x.km+' km</span>':x.area==='out'?'<span class="vi-p out">⛔ outside · '+Math.round(x.km)+' km</span>':'<span class="vi-p nopin">no pin</span>'; };
  document.getElementById('vi-list').innerHTML=!L.length?'<div class="sr-empty">No orders in this period.</div>':
    '<table class="vi-t"><tr>'+th('','Customer')+th('','Phone')+th('n','Orders')+th('spent','Spent')+th('last','Last order')+th('','Area')+'</tr>'+
    L.map(function(x){ return '<tr><td dir="auto">'+escHtml(x.name||'—')+'</td><td dir="ltr">••'+escHtml(x.last4||'')+'</td><td><b>'+x.n+'</b></td><td>'+Number(x.spent||0).toFixed(0)+' SAR</td><td>'+_viAgo(x.last_o)+'</td><td>'+area(x)+'</td></tr>'; }).join('')+'</table>';
}

function srCheck(i){ var x=((SR.data||{}).not_found||[])[i]; if(!x)return; goSection('products'); setTimeout(function(){ var q=document.getElementById('pr-q'); if(q){ q.value=x.q; prSearch(x.q); } },50); }
async function srAdd(i){ var x=((SR.data||{}).not_found||[])[i]; if(!x)return; await prQuickAdd(); var nm=document.getElementById('pra-name'); if(nm){ nm.value=x.q; _praCheck(); } }

async function loadMarketingOverview(){
  var since=new Date(Date.now()-30*864e5).toISOString(), set=function(id,t,cls){ var e=document.getElementById(id); if(e){ e.textContent=t; if(cls!==undefined)e.className='st '+cls; } };
  var n=function(x){ return Number(x||0).toLocaleString('en'); };
  try{ var r=await sb.from('push_notifications').select('id,status,clicks,created_at').neq('status','canceled').gte('created_at',since).limit(2000);
    if(!r.error){ var sent=(r.data||[]).filter(function(x){return x.status==='sent';}), sch=(r.data||[]).filter(function(x){return x.status==='scheduled';}).length, cl=sent.reduce(function(a,x){return a+Number(x.clicks||0);},0);
      set('mk-k-notif',n(sent.length)); set('mk-k-notif-s',n(cl)+' opens');
      var last=sent.map(function(x){return x.created_at;}).sort().pop();
      set('mk-st-notif',(last?'Last sent: '+new Date(last).toLocaleString('en-GB',{timeZone:'Asia/Riyadh',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'Nothing sent in 30 days')+(sch?' · '+sch+' scheduled':''),last?'ok':''); } }catch(e){}
  try{ var f=await sb.from('referrals').select('status,created_at').gte('created_at',since).limit(5000); var w=await sb.from('referrals').select('id',{count:'exact',head:true}).eq('status','pending');
    if(!f.error){ set('mk-k-ref',n((f.data||[]).length)); }
    var wn=(w&&!w.error)?(w.count||0):0; set('mk-k-ref-s',wn?wn+' waiting for you':'none waiting'); set('mk-st-ref',wn?wn+' waiting for your approval':'Nothing waiting',wn?'warn':'ok'); }catch(e){}
  try{ var st=await sb.from('settings').select('key,value').in('key',['cart_reminder_on','home_offers']); var v={}; ((st&&st.data)||[]).forEach(function(x){ v[x.key]=x.value; });
    set('mk-st-cr',v.cart_reminder_on==='1'?'🟢 ON':'⚪ OFF',v.cart_reminder_on==='1'?'ok':'');
    try{ var lrv=await sb.from('settings').select('value').eq('key','loyalty_reminders').limit(1); var lro=JSON.parse((lrv.data&&lrv.data[0]&&lrv.data[0].value)||'{}'); set('mk-st-lr',lro.on?'🟢 ON':'⚪ OFF',lro.on?'ok':''); }catch(e){}
    var offers=[]; try{ offers=JSON.parse(v.home_offers||'[]'); }catch(e){} var liveO=(Array.isArray(offers)?offers:[]).filter(function(x){return x&&x.active!==false;}).length;
    var b=await sb.from('banners').select('is_active'); var liveB=(b&&!b.error)?(b.data||[]).filter(function(x){return x.is_active;}).length:0;
    set('mk-st-ob',liveB+' slide'+(liveB===1?'':'s')+' · '+liveO+' offer'+(liveO===1?'':'s')+' live',(liveB+liveO)?'ok':''); }catch(e){}
  try{ var cr=await sb.rpc('cart_reminder_stats',{p_days:30}); if(!cr.error&&cr.data){ set('mk-k-cr',n(cr.data.recovered)); set('mk-k-cr-s','+'+n(Math.round(cr.data.sar||0))+' SAR'); } }catch(e){}
  try{ var ss=await sb.rpc('admin_search_stats',{p_days:1}); if(!ss.error&&ss.data){ var z=(ss.data.not_found||[]).length; set('mk-st-sr',n(ss.data.total)+' today · '+z+' not found',z?'warn':(ss.data.total?'ok':'')); } }catch(e){}
  _mkSyncRefBadge();
}

// ══════════════════════════════════
// BANNERS
// ══════════════════════════════════
async function loadBanners(){
  document.getElementById('banners-list').innerHTML='<div class="loading">Loading...</div>';
  try{const{data}=await sb.from('banners').select('*').order('sort_order');renderBanners(data||[]);}
  catch(e){document.getElementById('banners-list').innerHTML='<div class="empty-state"><i class="ti ti-photo"></i>Error loading</div>';}
}

function _bnText(t){ return /[\u0600-\u06FFa-zA-Z0-9]/.test(String(t||'')); }   // same rule as the home page: "." or spaces = no text
function renderBanners(list){
  if(!list.length){document.getElementById('banners-list').innerHTML='<div class="empty-state"><i class="ti ti-photo"></i>No banners yet</div>';return;}
  document.getElementById('banners-list').innerHTML=list.map(b=>{
    const activeBg=b.is_active?'var(--green-bg)':'var(--bg)';
    const activeColor=b.is_active?'var(--green-text)':'var(--muted)';
    const tx=v=>_bnText(v)?escHtml(v):'';
    const title=tx(b.title), tag=tx(b.tag), sub=tx(b.subtitle), btnTx=tx(b.button_text), hasTx=!!(title||tag||sub||btnTx);
    return '<div class="banner-card">'+
      '<div class="banner-preview" style="background:'+escHtml(b.bg_color||'#9d174d')+'">'+
        (b.image_url?'<div class="banner-preview-bg"><img src="'+escHtml(b.image_url)+'"/></div>'+(title||sub?'<div class="banner-preview-overlay"></div>':''):'')+
        (b.image_url&&!hasTx?'<span class="banner-photo-only">📷 Photo only</span>':'')+
        '<div class="banner-preview-content">'+
          (tag?'<div class="banner-preview-tag">'+tag+'</div>':'')+
          (title?'<div class="banner-preview-title">'+title+'</div>':'')+
          (sub?'<div style="font-size:11px;color:rgba(255,255,255,0.8);margin-top:2px">'+sub+'</div>':'')+
          (btnTx?'<span class="banner-preview-btn">'+btnTx+'</span>':'')+
        '</div>'+
        '<div class="banner-preview-actions">'+
          '<button class="icon-btn icon-btn-rose" data-id="'+escHtml(b.id)+'" onclick="openEditBanner(this.dataset.id)"><i class="ti ti-edit"></i></button>'+
          '<button class="icon-btn icon-btn-red" data-id="'+escHtml(b.id)+'" data-t="'+(title||'photo banner')+'" onclick="deleteBanner(this.dataset.id,this.dataset.t)"><i class="ti ti-trash"></i></button>'+
        '</div>'+
      '</div>'+
      '<div class="banner-footer">'+
        '<span style="color:var(--muted);font-size:11px">#'+escHtml(b.sort_order)+' · '+(btnTx?btnTx+' · ':'')+'tap → '+escHtml(b.button_link||'/')+'</span>'+
        '<span class="chip" style="background:'+activeBg+';color:'+activeColor+'">'+( b.is_active?'Active':'Hidden')+'</span>'+
      '</div>'+
    '</div>';
  }).join('');
}

function openAddBanner(){
  document.getElementById('modal-banner-title').textContent='Add banner';
  document.getElementById('b-edit-id').value='';
  document.getElementById('b-title').value='';
  document.getElementById('b-sub').value='';
  document.getElementById('b-tag').value='';
  document.getElementById('b-btn-text').value='';
  document.getElementById('b-btn-link').value='/restaurants';
  document.getElementById('b-color').value='#9d174d';
  document.getElementById('b-color-hex').value='#9d174d';
  document.getElementById('b-order').value='1';
  document.getElementById('b-active').value='true';
  document.getElementById('banner-img-preview').style.display='none';
  document.getElementById('banner-img-ph').style.display='block';
  bannerImgFile=null;bannerImgUrl=''; document.getElementById('banner-err').style.display='none';
  showModal('modal-banner');
}

async function openEditBanner(id){
  const{data}=await sb.from('banners').select('*').eq('id',id).single();
  if(!data)return;
  document.getElementById('modal-banner-title').textContent='Edit banner';
  document.getElementById('b-edit-id').value=id;
  document.getElementById('b-title').value=_bnText(data.title)?data.title:'';
  document.getElementById('b-sub').value=_bnText(data.subtitle)?data.subtitle:'';
  document.getElementById('b-tag').value=_bnText(data.tag)?data.tag:'';
  document.getElementById('b-btn-text').value=_bnText(data.button_text)?data.button_text:'';
  document.getElementById('b-btn-link').value=data.button_link||'/';
  document.getElementById('b-color').value=data.bg_color||'#9d174d';
  document.getElementById('b-color-hex').value=data.bg_color||'#9d174d';
  document.getElementById('b-order').value=data.sort_order||1;
  document.getElementById('b-active').value=String(data.is_active);
  bannerImgUrl=data.image_url||'';
  bannerImgFile=null; document.getElementById('banner-err').style.display='none';
  if(bannerImgUrl){document.getElementById('banner-img-preview').src=bannerImgUrl;document.getElementById('banner-img-preview').style.display='block';document.getElementById('banner-img-ph').style.display='none';}
  else{document.getElementById('banner-img-preview').style.display='none';document.getElementById('banner-img-ph').style.display='block';}
  showModal('modal-banner');
}

function handleBannerImg(input){
  const file=input.files[0];if(!file)return;
  bannerImgFile=file;
  const r=new FileReader();
  r.onload=e=>{document.getElementById('banner-img-preview').src=e.target.result;document.getElementById('banner-img-preview').style.display='block';document.getElementById('banner-img-ph').style.display='none';};
  r.readAsDataURL(file);
}

async function saveBanner(){
  const btn=document.getElementById('banner-save-btn');
  const err=document.getElementById('banner-err');
  const title=document.getElementById('b-title').value.trim();
  if(!title&&!bannerImgFile&&!bannerImgUrl){err.style.display='block';err.textContent='Add a photo or a title (a banner needs at least one).';return;}
  btn.innerHTML='<i class="ti ti-loader"></i> Saving...';btn.disabled=true;err.style.display='none';
  try{
    if(bannerImgFile){const url=await uploadImg(bannerImgFile,'banners');if(url)bannerImgUrl=url;}
    const payload={title:title||null,subtitle:document.getElementById('b-sub').value.trim()||null,tag:document.getElementById('b-tag').value.trim()||null,button_text:document.getElementById('b-btn-text').value.trim()||null,button_link:document.getElementById('b-btn-link').value.trim()||'/',bg_color:document.getElementById('b-color').value,sort_order:Number(document.getElementById('b-order').value)||1,is_active:document.getElementById('b-active').value==='true',image_url:bannerImgUrl||null};
    const editId=document.getElementById('b-edit-id').value;
    let supaErr;
    if(editId){const{error}=await sb.from('banners').update(payload).eq('id',editId);supaErr=error;}
    else{const{error}=await sb.from('banners').insert([payload]);supaErr=error;}
    if(supaErr)throw new Error(supaErr.message);
    btn.innerHTML='<i class="ti ti-check"></i> Save banner';btn.disabled=false;
    showToast(editId?'Banner updated ✓':'Banner added ✓');
    closeModal('modal-banner');loadBanners();
  }catch(e){err.style.display='block';err.textContent='Error: '+e.message;btn.innerHTML='<i class="ti ti-check"></i> Save banner';btn.disabled=false;}
}

async function deleteBanner(id,title){
  if(!confirm('Delete banner "'+title+'"?'))return;
  await sb.from('banners').delete().eq('id',id);
  loadBanners();showToast('Banner deleted');
}

// ══════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════
const NOTIF_TEMPLATES={
  offer:{ar:{t:'🎉 عرض خاص اليوم!',b:'استمتع بخصم 20% على جميع الطلبات. العرض محدود!'},en:{t:'🎉 Special Offer Today!',b:'Enjoy 20% off all orders. Limited time offer!'}},
  free:{ar:{t:'🆓 توصيل مجاني الآن',b:'اطلب الآن واستمتع بتوصيل مجاني على جميع طلباتك!'},en:{t:'🆓 Free Delivery Now',b:'Order now and enjoy free delivery on all your orders!'}},
  new:{ar:{t:'🆕 مطعم جديد انضم إلينا',b:'اكتشف قائمة طعام رائعة من أحدث مطعم على التطبيق'},en:{t:'🆕 New Restaurant Joined',b:'Discover amazing food from the newest restaurant on the app'}},
  ramadan:{ar:{t:'🌙 عروض رمضان الخاصة',b:'استمتع بأشهى الأطباق الرمضانية مع خصومات حصرية'},en:{t:'🌙 Ramadan Special Offers',b:'Enjoy the best Ramadan dishes with exclusive discounts'}},
  weekend:{ar:{t:'🎊 عروض نهاية الأسبوع',b:'نهاية الأسبوع أحلى مع عروضنا المميزة. اطلب الآن!'},en:{t:'🎊 Weekend Deals Are Here',b:"Weekend is better with our special deals. Order now!"}},
};

function useTemplate(key){
  const t=NOTIF_TEMPLATES[key];
  if(!t)return;
  document.getElementById('notif-title-ar').value=t.ar.t;
  document.getElementById('notif-title-en').value=t.en.t;
  document.getElementById('notif-body-ar').value=t.ar.b;
  document.getElementById('notif-body-en').value=t.en.b;
  showToast('Template loaded ✓');
}

function loadNotifSettings(){
  sb.from('device_tokens').select('id',{count:'exact',head:true}).then(({count})=>{
    const el=document.getElementById('device-count');
    if(el)el.textContent=count!=null?count:'—';
  });
  // Breakdown by platform — so you can see Android vs iPhone vs Web at a glance
  sb.from('device_tokens').select('platform').then(({data,error})=>{
    const el=document.getElementById('device-breakdown');
    if(!el)return;
    if(error||!data){el.textContent='';return;}
    var a=0,i=0,w=0,o=0;
    data.forEach(function(r){
      var p=(r.platform||'').toString().toLowerCase();
      if(p==='android')a++; else if(p==='ios')i++; else if(p==='web')w++; else o++;
    });
    el.innerHTML='🤖 Android '+a+' · 🍎 iPhone '+i+' · 🌐 Web '+w+(o?(' · ❔ '+o):'');
  });
  testFcmConnection();
}

function saveNotifSettings(){}

async function testFcmConnection(){
  const el=document.getElementById('fcm-status');
  if(!el)return;
  el.innerHTML='<i class="ti ti-loader" style="font-size:12px"></i> Checking...';
  try{
    const res=await fetch('/notify.php',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({payload:{registration_ids:[],notification:{title:'test',body:'test'},data:{}}})
    });
    const d=await res.json();
    if(d.error==='not_configured'){
      el.innerHTML='<span style="color:var(--amber)"><i class="ti ti-alert-circle"></i> Service account not configured in notify.php yet</span>';
    }else{
      el.innerHTML='<span style="color:var(--green-text)"><i class="ti ti-circle-check"></i> Firebase connected ✓</span>';
    }
  }catch(e){
    el.innerHTML='<span style="color:var(--red)"><i class="ti ti-alert-circle"></i> notify.php not found — upload it to Hostinger</span>';
  }
}

function showNotifPreview(){
  const titleAr=document.getElementById('notif-title-ar').value||'عنوان الإشعار';
  const bodyAr=document.getElementById('notif-body-ar').value||'نص الرسالة';
  const img=document.getElementById('notif-img').value;
  document.getElementById('notif-preview-body').innerHTML=
    '<div style="background:#f1f5f9;border-radius:12px;padding:14px;margin-bottom:12px">'+
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
    '<div style="width:32px;height:32px;background:var(--rose);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px">📦</div>'+
    '<div><div style="font-size:11px;color:var(--muted)">خطوة التوصيل</div><div style="font-size:10px;color:var(--muted)">now</div></div></div>'+
    '<div style="font-weight:600;font-size:13px;margin-bottom:4px;direction:rtl">'+titleAr+'</div>'+
    '<div style="font-size:12px;color:var(--muted);direction:rtl">'+bodyAr+'</div>'+
    (img?'<img src="'+img+'" style="width:100%;border-radius:8px;margin-top:8px;max-height:120px;object-fit:cover"/>':'')+
    '</div>'+
    '<div style="font-size:11px;color:var(--muted);text-align:center">This is how the notification appears on iPhone/Android</div>';
  document.getElementById('modal-notif-preview').style.display='flex';
  document.getElementById('modal-notif-preview').classList.add('show');
}

async function sendPushNotification(){
  const titleAr=document.getElementById('notif-title-ar').value.trim();
  const titleEn=document.getElementById('notif-title-en').value.trim()||titleAr;
  const bodyAr=document.getElementById('notif-body-ar').value.trim();
  const bodyEn=document.getElementById('notif-body-en').value.trim()||bodyAr;
  const target=document.getElementById('notif-target').value;
  const img=document.getElementById('notif-img').value.trim();
  const errEl=document.getElementById('notif-err');
  errEl.style.display='none';
  const btn=document.getElementById('notif-send-btn');

  if(!titleAr){errEl.textContent='Arabic title is required';errEl.style.display='block';return;}
  if(!bodyAr){errEl.textContent='Arabic message is required';errEl.style.display='block';return;}

  // ── SCHEDULE MODE: save it; the server sends it automatically at the set time ──
  if(document.getElementById('notif-schedule-on').checked){
    const d=document.getElementById('notif-sched-date').value, t=document.getElementById('notif-sched-time').value;
    if(!d||!t){errEl.textContent='Pick a date and time to schedule';errEl.style.display='block';return;}
    const when=new Date(d+'T'+t);
    if(isNaN(when.getTime())||when.getTime()<=Date.now()){errEl.textContent='Pick a future date and time';errEl.style.display='block';return;}
    btn.disabled=true;btn.innerHTML='<i class="ti ti-loader" style="font-size:15px"></i> Scheduling...';
    try{
      await sb.from('push_notifications').insert({title_ar:titleAr,title_en:titleEn,body_ar:bodyAr,body_en:bodyEn,target,image_url:img||null,status:'scheduled',scheduled_for:when.toISOString(),recipients:0});
      showToast('✓ Scheduled for '+when.toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}));
      clearNotifForm();loadNotifHistory();
    }catch(e){errEl.textContent='Could not schedule: '+e.message;errEl.style.display='block';}
    finally{btn.disabled=false;toggleSchedule();}
    return;
  }

  // ── SEND NOW ── save the row FIRST so the notification carries an id for click tracking
  let notifId=null;
  try{
    const{data:ins}=await sb.from('push_notifications').insert({title_ar:titleAr,title_en:titleEn,body_ar:bodyAr,body_en:bodyEn,target,image_url:img||null,status:'sent',recipients:0}).select('id').single();
    if(ins)notifId=ins.id;
  }catch(e){}

  let query=sb.from('device_tokens').select('token,platform');
  if(target==='android')query=query.eq('platform','android');
  else if(target==='ios')query=query.eq('platform','ios');
  else if(target==='active')query=query.gte('last_seen',new Date(Date.now()-7*864e5).toISOString());
  else if(target==='test')query=query.order('last_seen',{ascending:false,nullsFirst:false}).limit(1); // 🧪 only the newest-active device (yours)
  const{data:tokensData,error:tokensError}=await query;

  if(tokensError||!tokensData||!tokensData.length){
    errEl.textContent='⚠️ No registered devices yet. Users need to install and open the updated app first.';
    errEl.style.display='block';
    if(notifId){try{await sb.from('push_notifications').delete().eq('id',notifId);}catch(_){}}
    return;
  }

  const tokens=tokensData.map(t=>t.token);
  btn.disabled=true;btn.innerHTML='<i class="ti ti-loader" style="font-size:15px"></i> Sending to '+tokens.length+' devices...';
  const clickUrl=notifId?('https://deliverystep.app/?n='+notifId):'https://deliverystep.app/';
  let successCount=0;
  const BATCH=500;

  try{
    for(let i=0;i<tokens.length;i+=BATCH){
      const batch=tokens.slice(i,i+BATCH);
      const fcmPayload={
        registration_ids:batch,
        notification:{title:titleAr,body:bodyAr,...(img?{image:img}:{})},
        data:{title_ar:titleAr,title_en:titleEn,body_ar:bodyAr,body_en:bodyEn,url:clickUrl,notif_id:(notifId?String(notifId):''),...(img?{image:img}:{})}
      };
      const res=await fetch('/notify.php',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({payload:fcmPayload})
      });
      if(!res.ok)throw new Error('notify.php returned HTTP '+res.status);
      const data=await res.json();
      if(data.error&&data.error!=='not_configured')throw new Error(data.error);
      if(data.error==='not_configured')throw new Error('Service account not configured in notify.php — see setup instructions above.');
      successCount+=data.success||0;
    }
    if(notifId){try{await sb.from('push_notifications').update({recipients:successCount}).eq('id',notifId);}catch(_){}
      try{await sb.from('push_notifications').update({sent_count:tokens.length}).eq('id',notifId);}catch(_){}}
    showToast('✓ Sent to '+successCount+' devices!');
    clearNotifForm();
    loadNotifHistory();
  }catch(e){
    errEl.textContent='Error: '+e.message;errEl.style.display='block';
  }finally{
    btn.disabled=false;btn.innerHTML='<i class="ti ti-bell-ringing" style="font-size:15px"></i> Send to all users';
  }
}

function clearNotifForm(){
  ['notif-title-ar','notif-title-en','notif-body-ar','notif-body-en','notif-img'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var s=document.getElementById('notif-schedule-on');if(s){s.checked=false;toggleSchedule();}
}

function toggleSchedule(){
  var on=document.getElementById('notif-schedule-on').checked;
  document.getElementById('notif-schedule-row').style.display=on?'flex':'none';
  var btn=document.getElementById('notif-send-btn');
  if(btn)btn.innerHTML=on?'<i class="ti ti-clock" style="font-size:15px"></i> Schedule notification':'<i class="ti ti-bell-ringing" style="font-size:15px"></i> Send to all users';
}

async function cancelScheduledNotif(id){
  try{await sb.from('push_notifications').update({status:'canceled'}).eq('id',id);showToast('Scheduled notification canceled');loadNotifHistory();}catch(e){showToast('Could not cancel');}
}

function _nEsc(s){return String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function _nHour(h){var ap=h<12?'AM':'PM';var hh=h%12;if(hh===0)hh=12;return hh+' '+ap;}
function _nBar(vals,labels){
  var max=Math.max.apply(null,vals.concat([1]));
  return '<div style="display:flex;align-items:flex-end;gap:8px;height:128px;padding-top:14px">'+vals.map(function(v,i){
    var h=Math.round((v/max)*100);
    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%"><div style="flex:1;width:100%;display:flex;align-items:flex-end;justify-content:center"><div style="width:62%;max-width:30px;height:'+h+'%;min-height:4px;background:linear-gradient(180deg,#e879b8,#be185d);border-radius:6px 6px 2px 2px;position:relative"><span style="position:absolute;top:-15px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:800;color:#9d174d">'+(v||'')+'</span></div></div><div style="font-size:10px;color:#94a3b8;font-weight:600">'+labels[i]+'</div></div>';
  }).join('')+'</div>';
}
function _nDonut(segs){
  var tot=segs.reduce(function(s,x){return s+x.v;},0)||1; var off=25; var arcs='';
  segs.forEach(function(s){ if(s.v<=0)return; var pct=s.v/tot*100; arcs+='<circle cx="21" cy="21" r="15.915" fill="none" stroke="'+s.color+'" stroke-width="6" stroke-dasharray="'+pct.toFixed(2)+' '+(100-pct).toFixed(2)+'" stroke-dashoffset="'+off.toFixed(2)+'"/>'; off-=pct; });
  return '<svg width="104" height="104" viewBox="0 0 42 42"><circle cx="21" cy="21" r="15.915" fill="none" stroke="#eef0f3" stroke-width="6"/>'+arcs+'<text x="21" y="20.5" text-anchor="middle" font-size="7" font-weight="800" fill="#0f172a">'+tot+'</text><text x="21" y="26" text-anchor="middle" font-size="3" fill="#94a3b8">devices</text></svg>';
}
async function loadNotifDashboard(){
  var host=document.getElementById('notif-dash'); if(!host)return;
  try{
    var dv=await sb.from('device_tokens').select('platform,last_seen');
    var D=dv.data||[]; var total=D.length,iOS=0,And=0,Web=0,active=0,wk=Date.now()-7*864e5;
    D.forEach(function(r){var p=(r.platform||'').toLowerCase();if(p==='ios')iOS++;else if(p==='android')And++;else Web++;var ls=r.last_seen?new Date(r.last_seen).getTime():0;if(ls>=wk)active++;});
    var nf=await sb.from('push_notifications').select('*').neq('status','canceled');
    var N=nf.data||[]; var now=Date.now();
    var sent=N.filter(function(n){return n.status!=='scheduled';});
    var sends30=sent.filter(function(n){return n.created_at&&(now-new Date(n.created_at).getTime())<2592e6;}).length;
    var clicks=sent.reduce(function(s,n){return s+(Number(n.clicks)||0);},0);
    var recip=sent.reduce(function(s,n){return s+(Number(n.recipients)||0);},0);
    var openRate=recip>0?(clicks/recip*100):0;
    var best=null,bc=-1; sent.forEach(function(n){var r=Number(n.recipients)||0,c=Number(n.clicks)||0;if(r>0&&c/r>bc){bc=c/r;best=n;}});
    var days=[0,0,0,0,0,0,0],hours=new Array(24).fill(0),haveLog=false;
    try{
      var since=new Date(Date.now()-7*864e5).toISOString();
      var cl=await sb.from('notif_clicks').select('clicked_at').gte('clicked_at',since).limit(5000);
      if(cl&&!cl.error&&cl.data){haveLog=true;cl.data.forEach(function(r){var t=new Date(r.clicked_at).getTime();var idx=6-Math.floor((Date.now()-t)/864e5);if(idx>=0&&idx<7)days[idx]++;hours[new Date(r.clicked_at).getHours()]++;});}
    }catch(e){}
    var bh=-1,bhc=0; hours.forEach(function(c,h){if(c>bhc){bhc=c;bh=h;}});
    window._notifBestHour=(haveLog&&bh>=0)?bh:-1;
    var _bl=document.getElementById('best-time-btn-lbl'); if(_bl)_bl.textContent=(haveLog&&bh>=0)?('Send at best time · '+_nHour(bh)):'Send at best time';
    var dn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],labels=[];
    for(var i=6;i>=0;i--){labels.push(dn[new Date(Date.now()-i*864e5).getDay()]);}
    function kpi(l,v,s){return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:13px 14px;min-width:0"><div style="font-size:11.5px;color:var(--muted);font-weight:600">'+l+'</div><div style="font-size:25px;font-weight:800;letter-spacing:-.02em;margin-top:4px;line-height:1">'+v+'</div><div style="font-size:11px;color:var(--muted);margin-top:6px">'+(s||'&nbsp;')+'</div></div>';}
    var html='<div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:12px">'
      +kpi('📱 Total devices',total,'🍎 '+iOS+' · 🤖 '+And+(Web?(' · 🌐 '+Web):''))
      +kpi('📨 Sent (30 days)',sends30,recip.toLocaleString()+' deliveries')
      +kpi('👆 Total clicks',clicks,active+' active in 7d')
      +kpi('🎯 Open rate',openRate.toFixed(1)+'%',best?('Best: '+_nEsc((best.title_ar||best.title_en||'—')).slice(0,22)):'&nbsp;')
      +'</div>';
    html+='<div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-bottom:'+(haveLog&&bh>=0?'12px':'16px')+'">'
      +'<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:14px"><div style="font-size:13px;font-weight:800;margin-bottom:6px">Clicks — last 7 days</div>'+_nBar(days,labels)+'</div>'
      +'<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:14px"><div style="font-size:13px;font-weight:800;margin-bottom:10px">Devices by platform</div><div style="display:flex;align-items:center;gap:14px">'+_nDonut([{v:iOS,color:'#0a84ff'},{v:And,color:'#3ddc84'},{v:Web,color:'#f59e0b'}])
        +'<div style="font-size:12.5px;line-height:1.85"><div><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#0a84ff;margin-right:6px"></span>iPhone <b>'+iOS+'</b></div><div><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#3ddc84;margin-right:6px"></span>Android <b>'+And+'</b></div>'+(Web?'<div><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#f59e0b;margin-right:6px"></span>Web <b>'+Web+'</b></div>':'')+'</div></div></div>'
      +'</div>';
    if(haveLog&&bh>=0){html+='<div style="background:linear-gradient(120deg,#fdeef5,#fff);border:1px solid #f6d6e6;border-radius:14px;padding:12px 15px;margin-bottom:16px"><div style="font-size:11px;color:var(--muted)">💡 Smart insight</div><div style="font-size:14px;font-weight:800;color:#9d174d;margin-top:2px">Your customers click most around '+_nHour(bh)+'. Try scheduling your next notification then for more opens.</div></div>';}
    host.innerHTML=html;
  }catch(e){
    host.innerHTML='<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;font-size:12px;color:var(--muted);text-align:center">Run the <strong>notifications-phase1</strong> SQL in Supabase to enable the full dashboard.</div>';
  }
}
function updateNotifLivePreview(){
  var tv=(document.getElementById('notif-title-ar')||{}).value, bv=(document.getElementById('notif-body-ar')||{}).value, iv=(document.getElementById('notif-img')||{}).value;
  var te=document.getElementById('np-title'); if(te)te.textContent=tv||'عنوان الإشعار';
  var be=document.getElementById('np-body'); if(be)be.textContent=bv||'نص الرسالة';
  var iw=document.getElementById('np-img'), ie=document.getElementById('np-img-el');
  if(iw&&ie){ if(iv){ie.src=iv;iw.style.display='block';} else {iw.style.display='none';} }
}
async function updateNotifAudienceCounts(){
  try{
    var dv=await sb.from('device_tokens').select('platform,last_seen'); var D=dv.data||[];
    var all=D.length,ios=0,and=0,act=0,wk=Date.now()-7*864e5;
    D.forEach(function(r){var p=(r.platform||'').toLowerCase();if(p==='ios')ios++;else if(p==='android')and++;var ls=r.last_seen?new Date(r.last_seen).getTime():0;if(ls>=wk)act++;});
    function setl(id,t){var e=document.getElementById(id);if(e)e.textContent=t;}
    setl('nt-all','Everyone ('+all+')'); setl('nt-ios','iPhone only ('+ios+')'); setl('nt-android','Android only ('+and+')'); setl('nt-active','Active users · last 7d ('+act+')'); setl('nt-test','🧪 Test — my device only (1)');
  }catch(e){}
}
function setBestTimeSchedule(){
  var h=(typeof window._notifBestHour==='number')?window._notifBestHour:-1;
  if(h<0){showToast('Not enough click data yet — send a few notifications first');return;}
  var on=document.getElementById('notif-schedule-on'); if(on){on.checked=true;toggleSchedule();}
  var now=new Date(), target=new Date(now.getFullYear(),now.getMonth(),now.getDate(),h,0,0);
  if(target.getTime()<=now.getTime()+60000)target.setDate(target.getDate()+1);
  var d=document.getElementById('notif-sched-date'), t=document.getElementById('notif-sched-time');
  if(d)d.value=target.getFullYear()+'-'+String(target.getMonth()+1).padStart(2,'0')+'-'+String(target.getDate()).padStart(2,'0');
  if(t)t.value=String(h).padStart(2,'0')+':00';
  showToast('⏰ Scheduled for your best time — '+_nHour(h));
}
async function loadNotifHistory(){
  const el=document.getElementById('notif-history');
  try{
    const{data,error}=await sb.from('push_notifications').select('*').neq('status','canceled').order('created_at',{ascending:false}).limit(30);
    if(error||!data||!data.length){
      el.innerHTML='<div style="color:var(--muted);font-size:12px;text-align:center;padding:24px"><i class="ti ti-bell-off" style="font-size:28px;display:block;margin-bottom:8px"></i>No notifications yet.<br/>Create your first one above.</div>';
      return;
    }
    const now=Date.now();
    const sentRows=data.filter(function(n){return n.status!=='scheduled';});
    const monthCount=sentRows.filter(function(n){return n.created_at&&(now-new Date(n.created_at).getTime())<2592000000;}).length;
    const totalRecip=sentRows.reduce(function(s,n){return s+(Number(n.recipients)||0);},0);
    const totalClicks=sentRows.reduce(function(s,n){return s+(Number(n.clicks)||0);},0);
    const openRate=totalRecip>0?Math.round(totalClicks/totalRecip*100):0;
    var bestId=null,_bcc=-1;sentRows.forEach(function(n){var r=Number(n.recipients)||0,c=Number(n.clicks)||0;if(r>0&&c/r>_bcc){_bcc=c/r;bestId=n.id;}});
    function statBox(v,l){return '<div style="flex:1;border:1px solid var(--border);border-radius:10px;padding:8px;text-align:center"><div style="font-size:17px;font-weight:800;color:var(--rose)">'+v+'</div><div style="font-size:10px;color:var(--muted)">'+l+'</div></div>';}
    const stats='<div style="display:flex;gap:8px;margin-bottom:14px">'+statBox(sentRows.length,'Total sent')+statBox(monthCount,'This month')+statBox(openRate+'%','Open rate')+'</div>';

    function ago(ts){if(!ts)return '';var s=Math.floor((now-new Date(ts).getTime())/1000);if(s<3600)return Math.max(1,Math.floor(s/60))+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';var d=Math.floor(s/86400);return d===1?'1 day ago':d+' days ago';}
    function tgt(t){return t==='test'?'🧪 Test':t==='all'?'All users':t==='android'?'Android':t==='active'?'Active users':'iOS';}
    function esc(s){return String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

    const rows=data.map(function(n){
      if(n.status==='scheduled'){
        var when=n.scheduled_for?new Date(n.scheduled_for).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'';
        return '<div style="padding:12px;border:1px solid #fde68a;background:#fffbeb;border-radius:12px;margin-bottom:10px">'
          +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><div style="font-weight:600;font-size:13px">'+esc(n.title_ar||n.title_en||'—')+'</div><button onclick="cancelScheduledNotif(\''+n.id+'\')" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:8px;padding:3px 10px;font-size:11px;font-weight:700;cursor:pointer">Cancel</button></div>'
          +'<div style="font-size:12px;color:var(--muted);margin-bottom:6px;direction:rtl">'+esc(n.body_ar||'')+'</div>'
          +'<div style="display:flex;gap:6px;flex-wrap:wrap"><span style="font-size:10px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:20px">⏳ Scheduled · '+when+'</span><span style="font-size:10px;background:var(--blue-bg);color:var(--blue-text);padding:2px 8px;border-radius:20px">'+tgt(n.target)+'</span></div>'
          +'</div>';
      }
      var _r=Number(n.recipients)||0,_c=Number(n.clicks)||0,_ctr=_r>0?Math.round(_c/_r*100):0;
      var _dp=(n.sent_count&&Number(n.sent_count)>0)?Math.round(_r/Number(n.sent_count)*100):null;
      return '<div style="padding:12px 0;border-bottom:1px solid var(--border)'+(n.id===bestId?';background:#fffdf5':'')+'">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><div style="font-weight:600;font-size:13px">'+(n.id===bestId?'<span style="color:#f59e0b">★ </span>':'')+esc(n.title_ar||n.title_en||'—')+'</div><div style="font-size:10px;color:var(--muted)">'+ago(n.created_at)+'</div></div>'
        +'<div style="font-size:12px;color:var(--muted);margin-bottom:6px;direction:rtl">'+esc(n.body_ar||'')+'</div>'
        +'<div style="display:flex;gap:6px;flex-wrap:wrap">'
          +'<span style="font-size:10px;background:var(--blue-bg);color:var(--blue-text);padding:2px 8px;border-radius:20px">'+tgt(n.target)+'</span>'
          +(_r?'<span style="font-size:10px;background:var(--green-bg);color:var(--green-text);padding:2px 8px;border-radius:20px">📤 '+_r+' delivered'+(_dp!=null?' · '+_dp+'%':'')+'</span>':'')
          +'<span style="font-size:10px;background:#fdf2f8;color:#9d174d;padding:2px 8px;border-radius:20px">👆 '+_c+' clicks</span>'
        +'</div>'
        +(_r>0?'<div style="display:flex;align-items:center;gap:8px;margin-top:8px"><div style="flex:1;height:6px;background:#eef0f3;border-radius:6px;overflow:hidden"><div style="height:100%;width:'+Math.min(100,_ctr)+'%;background:linear-gradient(90deg,#f472b6,#be185d)"></div></div><span style="font-size:11px;font-weight:800;color:#9d174d;min-width:60px;text-align:right">'+_ctr+'% open</span></div>':'')
      +'</div>';
    }).join('');
    el.innerHTML=stats+rows;
  }catch(e){
    el.innerHTML='<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Run the <strong>notifications-upgrade</strong> SQL in Supabase to enable clicks + scheduling.</div>';
  }
}

function loadNotifications(){
  loadNotifSettings();
  loadNotifDashboard();
  updateNotifAudienceCounts();
  updateNotifLivePreview();
  loadNotifHistory();
}

// ── Cart reminders: one push to app customers who left products in their cart (sent by the database every 5 min) ──
var _cr={on:false,after:60,min:15,msg:'',second:false,msg2:''};
var _CR_DEF_MSG='🛒 سلتك تنتظرك! عندك {items} أصناف من {shop} ({total} ر.س) — أكمل طلبك الآن', _CR_DEF_MSG2='🎁 سلتك ما زالت محفوظة — أكمل طلبك اليوم';
function _crEl(id){ return document.getElementById(id); }
async function crLoad(){
  if(!_crEl('set-cr-card'))return;
  try{
    var r=await sb.from('settings').select('key,value').like('key','cart_reminder_%');
    if(r&&!r.error){ var v={}; (r.data||[]).forEach(function(x){ v[x.key]=x.value; });
      _cr={on:v.cart_reminder_on==='1', after:Number(v.cart_reminder_after_min)||60, min:v.cart_reminder_min_total==null?15:Number(v.cart_reminder_min_total)||0,
           msg:v.cart_reminder_msg||_CR_DEF_MSG, second:v.cart_reminder_second_on==='1', msg2:v.cart_reminder_second_msg||_CR_DEF_MSG2}; }
  }catch(e){}
  _crEl('cr-on').checked=_cr.on; _crEl('cr-min').value=_cr.min; _crEl('cr-msg').value=_cr.msg; _crEl('cr-second').checked=_cr.second; _crEl('cr-msg2').value=_cr.msg2;
  crAfter(_cr.after,true); crSecondUi(); _crState(); crPreview();
  ['cr-out','cr-test-out'].forEach(function(id){ _crEl(id).className='set-msg'; _crEl(id).textContent=''; });
  crStats();
}
function _crState(){
  var st=_crEl('cr-state'), h=_cr.after>=60?(_cr.after/60)+(_cr.after===60?' hour':' hours'):_cr.after+' min';
  st.className='set-state '+(_cr.on?'on':'off');
  st.textContent=_cr.on?'🟢 ON — app customers get one reminder '+h+' after leaving products in their cart':'⚪ OFF — no reminders are sent. Turn the switch on when you are ready.';
}
function crAfter(v,quiet){ _cr.after=[30,60,180].indexOf(Number(v))>=0?Number(v):60; document.querySelectorAll('#cr-after button').forEach(function(b){ b.classList.toggle('on',Number(b.dataset.v)===_cr.after); }); }
function crSecondUi(){ _crEl('cr-second-box').style.display=_crEl('cr-second').checked?'':'none'; }
function crTag(id,tag){ var t=_crEl(id), a=t.selectionStart==null?t.value.length:t.selectionStart, b=t.selectionEnd==null?a:t.selectionEnd; t.value=t.value.slice(0,a)+tag+t.value.slice(b); t.focus(); t.selectionStart=t.selectionEnd=a+tag.length; crPreview(); }
function _crFill(m){ return String(m||'').split('{items}').join('3').split('{shop}').join('فيوتشر برجر').split('{total}').join('64'); }
function crPreview(){
  var card=function(when,text){ return '<div class="t"><span><span class="lg">D</span>خطوة التوصيل</span><span>'+when+'</span></div><b>خطوة التوصيل</b><p>'+escHtml(_crFill(text))+'</p>'; };
  _crEl('cr-pv1').innerHTML=card('now',_crEl('cr-msg').value||_CR_DEF_MSG);
  var two=_crEl('cr-second').checked; _crEl('cr-pv2').style.display=two?'':'none';
  if(two)_crEl('cr-pv2').innerHTML=card('next day',_crEl('cr-msg2').value||_CR_DEF_MSG2);
}
// ── Loyalty card reminders (database job every hour 12–21; texts + on/off in settings «loyalty_reminders») ──
var _lr={cfg:null,stats:null};
var _LR_K=[['one_away','🎯 One order away (9 of 10)'],['earned','🎉 Free delivery earned (10 of 10)'],['unused','🎁 Free delivery not used after 7 days']];
async function loadLoyRem(){
  try{
    var r=await Promise.all([sb.from('settings').select('value').eq('key','loyalty_reminders').limit(1), sb.rpc('admin_loyalty_stats',{p_days:30})]);
    try{ _lr.cfg=JSON.parse((r[0].data&&r[0].data[0]&&r[0].data[0].value)||'{}'); }catch(e){ _lr.cfg={}; }
    if(r[1].error) throw r[1].error; _lr.stats=r[1].data||{};
  }catch(e){ document.getElementById('lr-state').textContent='❌ Could not load — '+(e.message||'check the internet'); return; }
  lrRender();
}
function lrRender(){
  var c=_lr.cfg||{}, s=_lr.stats||{}, k=s.kinds||{}, T=c.texts||{}, N=function(x){ return Number(x)||0; };
  document.getElementById('lr-on').checked=!!c.on;
  document.getElementById('lr-state').innerHTML=c.on?'🟢 <b>ON</b> — reminders go out by themselves (checked every hour, 12 PM – 9 PM).':'⚪ <b>OFF</b> — nothing is sent.';
  document.getElementById('lr-k-free').textContent=N(s.free_waiting); document.getElementById('lr-k-free-s').textContent=N(s.free_waiting_app)+' reachable in the app';
  document.getElementById('lr-k-one').textContent=N(s.one_away); document.getElementById('lr-k-one-s').textContent=N(s.one_away_app)+' reachable in the app';
  document.getElementById('lr-k-week').textContent=N(s.sent_week);
  var ord=0, sal=0, sent=0; _LR_K.forEach(function(x){ var v=k[x[0]]||{}; ord+=N(v.ordered); sal+=N(v.sales); sent+=N(v.sent); });
  document.getElementById('lr-k-ord').textContent=ord; document.getElementById('lr-k-ord-s').textContent=(sent?Math.round(ord/sent*100)+'% of '+sent+' sent · ':'')+Math.round(sal).toLocaleString('en-US')+' SAR';
  document.getElementById('lr-kinds').innerHTML='<tr><th>Message</th><th class="num">Sent</th><th class="num">Tapped</th><th class="num">Ordered</th><th class="num">Sales</th></tr>'+
    _LR_K.map(function(x){ var v=k[x[0]]||{}, se=N(v.sent);
      return '<tr><td>'+x[1]+'</td><td class="num">'+se+'</td><td class="num">'+N(v.tapped)+(se?' <span style="color:var(--muted);font-weight:600">('+Math.round(N(v.tapped)/se*100)+'%)</span>':'')+'</td><td class="num">'+N(v.ordered)+(se?' <span style="color:var(--muted);font-weight:600">('+Math.round(N(v.ordered)/se*100)+'%)</span>':'')+'</td><td class="num">'+Math.round(N(v.sales)).toLocaleString('en-US')+' SAR</td></tr>'; }).join('');
  document.getElementById('lr-texts').innerHTML=_LR_K.map(function(x){ var t=T[x[0]]||{};
    return '<div class="lr-txt"><label>'+x[1]+'</label><input id="lr-t-'+x[0]+'" maxlength="60" value="'+escHtml(t.title||'')+'" placeholder="Title"><input id="lr-b-'+x[0]+'" maxlength="140" value="'+escHtml(t.body||'')+'" placeholder="Message"></div>'; }).join('');
  var L=Array.isArray(s.waiting)?s.waiting:[];
  var day=function(d){ return d?new Date(d).toLocaleDateString('en-GB',{timeZone:'Asia/Riyadh',day:'numeric',month:'short'}):'—'; };
  document.getElementById('lr-list').innerHTML=L.length?'<tr><th>Customer</th><th>Status</th><th>Reached by</th><th class="hm">Last order</th><th class="hm">Reminded</th></tr>'+
    L.map(function(w){ var msg=w.free?('مرحباً '+(w.name||'')+' 👋\nعندك توصيل مجاني من بطاقة الولاء في خطوة التوصيل 🎁 اطلب متى ما حبيت والتوصيل علينا 🛵'):('مرحباً '+(w.name||'')+' 👋\nباقي لك طلب واحد بس في بطاقة الولاء — وبعده توصيلك مجاني 🎁');
      return '<tr><td><b class="dss-ar">'+escHtml(w.name||'—')+'</b><div style="font-size:11px;color:var(--muted);direction:ltr;text-align:left">+'+escHtml(w.phone||'')+'</div></td>'+
        '<td>'+(w.free?'<span class="lr-pill" style="background:#dcfce7;color:#166534">🎁 Free waiting</span>':'<span class="lr-pill" style="background:#fef3c7;color:#92400e">🎯 9 of 10</span>')+'</td>'+
        '<td>'+(w.app?'📱 App':'<a class="lr-wa" target="_blank" rel="noopener" href="https://wa.me/'+encodeURIComponent(w.phone||'')+'?text='+encodeURIComponent(msg)+'">💬 WhatsApp</a>')+'</td>'+
        '<td class="hm">'+day(w.last_at)+'</td><td class="hm">'+day(w.reminded_at)+'</td></tr>'; }).join(''):'<tr><td style="color:var(--muted)">Nobody is waiting right now.</td></tr>';
}
async function lrToggle(el){
  var c=Object.assign({},_lr.cfg||{}); c.on=el.checked;
  var ok=await _saveSettings([{key:'loyalty_reminders',value:JSON.stringify(c)}],'lr-out',c.on?'Loyalty reminders are ON':'Loyalty reminders are OFF — nothing will be sent');
  if(ok){ _lr.cfg=c; lrRender(); } else el.checked=!el.checked;
}
async function lrSaveTexts(){
  var c=Object.assign({},_lr.cfg||{}), T={};
  _LR_K.forEach(function(x){ T[x[0]]={title:document.getElementById('lr-t-'+x[0]).value.trim(), body:document.getElementById('lr-b-'+x[0]).value.trim()}; });
  if(_LR_K.some(function(x){ return !T[x[0]].title; })){ var o=document.getElementById('lr-out'); o.className='set-msg err'; o.textContent='❌ Every message needs a title'; return; }
  c.texts=T; if(await _saveSettings([{key:'loyalty_reminders',value:JSON.stringify(c)}],'lr-out','Messages saved — the next reminders use them')) _lr.cfg=c;
}
async function lrSendNow(){
  var s=_lr.stats||{}, n=(Number(s.free_waiting_app)||0)+(Number(s.one_away_app)||0);
  if(!confirm('Send the loyalty reminder now to the waiting app customers?\n\nCustomers who got one in the last 7 days are skipped.')) return;
  var o=document.getElementById('lr-out'); o.className='set-msg'; o.textContent='Sending…';
  try{ var r=await sb.rpc('admin_loyalty_send_now'); if(r.error) throw r.error; var sent=(r.data&&r.data.sent)||0;
    o.className='set-msg ok'; o.textContent=sent?'✅ Sent to '+sent+' customer'+(sent===1?'':'s'):'ℹ️ Nobody to send to right now (already reminded this week, or ordered in the last 12 hours)';
    loadLoyRem(); }catch(e){ o.className='set-msg err'; o.textContent='❌ Not sent — '+(e.message||'try again'); }
}
async function crToggle(el){
  var want=el.checked;
  if(want&&!confirm('Turn ON cart reminders?\n\nApp customers who leave products in their cart get ONE notification (never at night).'))return el.checked=false;
  var ok=await _saveSettings([{key:'cart_reminder_on',value:want?'1':'0'}],'cr-out',want?'Cart reminders are ON':'Cart reminders are OFF — nothing will be sent');
  if(ok){ _cr.on=want; _crState(); } else el.checked=!want;
}
async function crSave(){
  var msg=_crEl('cr-msg').value.trim(), msg2=_crEl('cr-msg2').value.trim(), min=String(_crEl('cr-min').value).trim();
  if(!msg)return _setErr('cr-out','Write the message first');
  if(min!==''&&(isNaN(Number(min))||Number(min)<0))return _setErr('cr-out','The minimum must be 0 or more');
  if(_crEl('cr-second').checked&&!msg2)return _setErr('cr-out','Write the second message, or untick the second reminder');
  var ok=await _saveSettings([
    {key:'cart_reminder_after_min',value:String(_cr.after)},{key:'cart_reminder_min_total',value:String(Number(min||0))},
    {key:'cart_reminder_msg',value:msg},{key:'cart_reminder_second_on',value:_crEl('cr-second').checked?'1':'0'},{key:'cart_reminder_second_msg',value:msg2||_CR_DEF_MSG2}
  ],'cr-out','Saved'+(_cr.on?' — used from the next reminder':' — turn the switch on to start sending'));
  if(ok){ _cr.msg=msg; _cr.msg2=msg2; _cr.min=Number(min||0); _cr.second=_crEl('cr-second').checked; _crState(); }
}
async function crTest(){
  var out=_crEl('cr-test-out'), ph=_crEl('cr-test-phone').value.trim();
  if(ph.replace(/\D/g,'').length<9&&!/[٠-٩]{9}/.test(ph)){ out.className='set-msg err'; out.textContent='❌ Type a full phone number, e.g. 0551234567'; return; }
  out.className='set-msg'; out.textContent='Sending…';
  try{
    var r=await sb.rpc('cart_reminder_test',{p_phone:ph});
    if(r.error)throw r.error;
    var m={sent:['ok','✅ Sent — the notification should arrive on that phone within a few seconds (it uses your saved message)'],
           no_app:['err','❌ No app order with notifications from this number yet — order once from the app on that phone, then try again'],
           bad_phone:['err','❌ Type a full phone number, e.g. 0551234567']}[r.data]||['err','❌ Could not send — try again'];
    out.className='set-msg '+m[0]; out.textContent=m[1];
  }catch(e){ out.className='set-msg err'; out.textContent='❌ Could not send — check the internet and try again'; }
}
async function crStats(){
  var box=_crEl('cr-stats'); if(!box)return;
  var s=null; try{ var r=await sb.rpc('cart_reminder_stats',{p_days:30}); if(!r.error)s=r.data; }catch(e){}
  if(!s){ box.innerHTML=''; _crEl('cr-stats-note').textContent='Results will show here after the first reminders.'; return; }
  var n=function(x){ return Number(x||0).toLocaleString('en'); };
  box.innerHTML='<div><b>'+n(s.left)+'</b><small>carts left</small></div><div><b>'+n(s.sent)+'</b><small>reminders sent</small></div>'
    +'<div class="g"><b>'+n(s.recovered)+'</b><small>orders recovered</small></div><div class="g"><b>'+n(Math.round(s.sar||0))+'</b><small>SAR recovered</small></div>';
  _crEl('cr-stats-note').textContent=n(s.waiting)+' cart'+(Number(s.waiting)===1?' is':'s are')+' waiting right now · '+n(s.app_phones)+' phones have the app with notifications';
}

// ══════════════════════════════════
// OFFERS (🔥 عروض اليوم on the customer home) — stored as JSON in settings.home_offers
// ══════════════════════════════════
var _offersData=[];
function _offEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function _offColorBg(c){return c==='green'?'linear-gradient(135deg,#34d399,#15803d)':c==='amber'?'linear-gradient(135deg,#fbbf24,#d97706)':'linear-gradient(135deg,#fb7185,#9d174d)';}
async function loadOffersAdmin(){
  var el=document.getElementById('offers-list'); if(el)el.innerHTML='<div class="loading">Loading...</div>';
  try{
    var res=await sb.from('settings').select('value').eq('key','home_offers').limit(1);
    var v=res&&res.data&&res.data[0]&&res.data[0].value; var arr=[];
    if(v){ try{ arr=(typeof v==='string')?JSON.parse(v):v; }catch(e){ arr=[]; } }
    _offersData=Array.isArray(arr)?arr:[];
  }catch(e){ _offersData=[]; }
  renderOffersList();
}
function renderOffersList(){
  var el=document.getElementById('offers-list'); if(!el)return;
  if(!_offersData.length){ el.innerHTML='<div style="padding:40px;text-align:center;color:var(--muted)"><i class="ti ti-discount-2" style="font-size:42px;opacity:.3;display:block;margin-bottom:10px"></i>No offers yet. Click "Add Offer" to show «عروض اليوم» on the home.</div>'; return; }
  el.innerHTML=_offersData.map(function(o,i){
    var color=(o.color==='green'||o.color==='amber')?o.color:'rose';
    var off=o.active===false;
    return '<div style="display:flex;align-items:center;gap:12px;background:var(--white);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px'+(off?';opacity:.55':'')+'">'
      +'<div style="flex-shrink:0;width:98px;height:64px;border-radius:12px;background:'+_offColorBg(color)+';color:#fff;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:8px">'
        +(o.badge?('<div style="font-size:9px;font-weight:800;background:rgba(255,255,255,.25);border-radius:10px;padding:1px 6px;align-self:flex-start;margin-bottom:3px">'+_offEsc(o.badge)+'</div>'):'')
        +'<div style="font-size:11px;font-weight:900;line-height:1.15">'+_offEsc(o.title||'')+'</div>'
        +'<div style="position:absolute;left:-4px;bottom:-8px;font-size:34px;opacity:.3">'+_offEsc(o.emoji||'🎉')+'</div>'
      +'</div>'
      +'<div style="flex:1;min-width:0">'
        +'<div style="font-weight:700;font-size:13px">'+_offEsc(o.title||'—')+'</div>'
        +'<div style="font-size:11px;color:var(--muted)">'+_offEsc(o.sub||'')+(o.code?(' · <span style="font-family:monospace;font-weight:700">'+_offEsc(o.code)+'</span>'):'')+(o.expires?(' · ⏰ '+_offEsc(o.expires)):'')+'</div>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:6px">'
        +'<label class="switch"><input type="checkbox" '+(off?'':'checked')+' onchange="toggleOfferActive('+i+',this.checked)"><span class="slider"></span></label>'
        +'<button class="r-act-btn" style="background:#dbeafe;color:#2563eb" title="Edit" onclick="editOffer('+i+')"><i class="ti ti-edit"></i></button>'
        +'<button class="r-act-btn" style="background:#fee2e2;color:#dc2626" title="Delete" onclick="deleteOffer('+i+')"><i class="ti ti-trash"></i></button>'
      +'</div>'
    +'</div>';
  }).join('');
}
function openOfferModal(idx){
  var has=(typeof idx==='number'), o=has?_offersData[idx]:null;
  document.getElementById('offer-modal-title').innerHTML=o?'<i class="ti ti-edit"></i> Edit Offer':'<i class="ti ti-discount-2"></i> New Offer';
  document.getElementById('offer-edit-id').value=has?idx:'';
  document.getElementById('offer-title').value=o?(o.title||''):'';
  document.getElementById('offer-sub').value=o?(o.sub||''):'';
  document.getElementById('offer-badge').value=o?(o.badge||''):'';
  document.getElementById('offer-emoji').value=o?(o.emoji||''):'';
  document.getElementById('offer-color').value=o?((o.color==='green'||o.color==='amber')?o.color:'rose'):'rose';
  document.getElementById('offer-code').value=o?(o.code||''):'';
  document.getElementById('offer-expires').value=o?(o.expires||''):'';
  document.getElementById('offer-link').value=o?(o.link||''):'';
  document.getElementById('offer-active').checked=o?(o.active!==false):true;
  document.getElementById('offer-err').style.display='none';
  document.getElementById('offer-modal').classList.add('show');
}
function closeOfferModal(){document.getElementById('offer-modal').classList.remove('show');}
function editOffer(i){openOfferModal(i);}
async function toggleOfferActive(i,checked){ if(_offersData[i]){ _offersData[i].active=checked; await _saveOffers(); showToast(checked?'Offer shown ✓':'Offer hidden'); } }
async function deleteOffer(i){ var o=_offersData[i]; if(!o)return; if(!confirm('Delete this offer?\n"'+(o.title||'')+'"'))return; _offersData.splice(i,1); await _saveOffers(); renderOffersList(); showToast('Offer deleted ✓'); }
async function saveOffer(){
  var err=document.getElementById('offer-err');
  var title=document.getElementById('offer-title').value.trim();
  if(!title){ err.style.display='block'; err.textContent='Enter a title'; return; }
  var obj={
    title:title,
    sub:document.getElementById('offer-sub').value.trim(),
    badge:document.getElementById('offer-badge').value.trim(),
    emoji:document.getElementById('offer-emoji').value.trim(),
    color:document.getElementById('offer-color').value,
    code:document.getElementById('offer-code').value.trim(),
    expires:document.getElementById('offer-expires').value,
    link:document.getElementById('offer-link').value.trim(),
    active:document.getElementById('offer-active').checked
  };
  var idx=document.getElementById('offer-edit-id').value;
  if(idx!==''&&_offersData[+idx]){ _offersData[+idx]=obj; } else { _offersData.push(obj); }
  var ok=await _saveOffers();
  if(!ok){ err.style.display='block'; err.textContent='Error saving. Check Supabase connection.'; return; }
  err.style.display='none'; closeOfferModal(); renderOffersList(); showToast('Offer saved ✓ — it now shows on the home');
}
async function _saveOffers(){
  try{ var r=await sb.from('settings').upsert([{key:'home_offers',value:JSON.stringify(_offersData)}],{onConflict:'key'}); return !(r&&r.error); }catch(e){ return false; }
}

/* ═══════ Referrals (Invite & Earn) — full tracking + safe approval (one reward per friend) ═══════ */
const REF_DEFAULT_REWARD=2; // used until the "Reward per friend" setting is loaded
var _rf={all:[],orders:{},accounts:[],used:[],visits:null,reward:REF_DEFAULT_REWARD,period:'all',filter:'all',q:''};
function _rfPhone(p){ var d=String(p||'').replace(/\D/g,''); if(d.indexOf('966')===0)d=d.slice(3); if(d.length===9)d='0'+d; return d||'—'; }
function _rf9(p){ return String(p||'').replace(/\D/g,'').slice(-9); }
function _rfDate(d){ try{ return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'}); }catch(e){ return ''; } }
function _rfFmt(n){ n=Number(n)||0; return String(Math.round(n*100)/100); }
function _rfSince(){ return _rf.period==='all'?0:Date.now()-Number(_rf.period)*86400000; }
function _rfDone(x){ return x.status==='approved'||x.status==='completed'; }
async function loadReferralsAdmin(){
  var safe=function(q){ return q.then(function(r){ return r||{}; },function(e){ return {error:e}; }); };
  var res=await Promise.all([
    safe(sb.from('referrals').select('*').order('created_at',{ascending:false}).limit(2000)),
    safe(sb.from('referral_accounts').select('phone,referral_code,credit_balance').limit(10000)),
    safe(sb.from('orders').select('order_number,customer_phone,ref_credit_used,created_at').gt('ref_credit_used',0).limit(10000)),
    safe(sb.from('referral_visits').select('code,device,day').limit(50000)),
    safe(sb.from('settings').select('value').eq('key','referral_reward_sr').limit(1))
  ]);
  _rf.all=res[0].data||[];
  _rf.accounts=res[1].data||[];
  _rf.used=res[2].data||[];
  _rf.visits=res[3].error?null:(res[3].data||[]);           // null = link opens not tracked yet (database not updated)
  var rv=res[4].data&&res[4].data[0]?Number(res[4].data[0].value):NaN;
  _rf.reward=(!isNaN(rv)&&rv>=0)?rv:REF_DEFAULT_REWARD;
  var inp=document.getElementById('rf-reward-set'); if(inp&&document.activeElement!==inp) inp.value=_rfFmt(_rf.reward);
  // each friend's order: is it real, delivered, cancelled?
  _rf.orders={};
  var nums=Array.from(new Set(_rf.all.map(function(x){ return x.referee_order_number; }).filter(Boolean)));
  for(var i=0;i<nums.length;i+=100){
    try{ var od=await sb.from('orders').select('order_number,order_status,total,customer_name').in('order_number',nums.slice(i,i+100));
      (od.data||[]).forEach(function(o){ _rf.orders[o.order_number]=o; }); }catch(e){}
  }
  renderReferralsAdmin();
}
function renderReferralsAdmin(){
  var g=function(id){ return document.getElementById(id); };
  var since=_rfSince();
  var inP=function(d){ return !since||new Date(d).getTime()>=since; };
  var list=_rf.all.filter(function(x){ return inP(x.created_at); });
  var pendAll=_rf.all.filter(function(x){ return (x.status||'pending')==='pending'; });
  var rewarded=list.filter(_rfDone), waiting=list.filter(function(x){ return (x.status||'pending')==='pending'; }), rejected=list.filter(function(x){ return x.status==='rejected'; });
  var paid=_rf.all.filter(function(x){ return x.status==='approved'&&inP(x.approved_at||x.created_at); }).reduce(function(s,x){ return s+Number(x.reward_sr||0); },0);
  var usedRows=_rf.used.filter(function(o){ return inP(o.created_at); });
  var used=usedRows.reduce(function(s,o){ return s+Number(o.ref_credit_used||0); },0);
  var unused=_rf.accounts.reduce(function(s,a){ return s+Math.max(0,Number(a.credit_balance||0)); },0);
  var holders=_rf.accounts.filter(function(a){ return Number(a.credit_balance||0)>0; }).length;
  var opens=_rf.visits===null?null:new Set(_rf.visits.filter(function(v){ return !since||new Date(v.day+'T23:59:59').getTime()>=since; }).map(function(v){ return v.code+'|'+v.device; })).size;
  var badge=g('ref-badge'); if(badge){ badge.textContent=pendAll.length; badge.style.display=pendAll.length?'inline-block':'none'; }
  var k=function(l,n,s,cls,ncls){ return '<div class="rf-kpi '+(cls||'')+'"><div class="l">'+l+'</div><div class="n '+(ncls||'')+'">'+n+'</div><div class="s">'+s+'</div></div>'; };
  if(g('rf-kpis')) g('rf-kpis').innerHTML=
    k('Referrals',list.length,'friends who ordered with a code')
   +k('Rewarded',rewarded.length,'friends who earned a reward','','g')
   +k('Waiting for you',waiting.length,'approve or reject below','amber')
   +k('Rejected',rejected.length,'not counted')
   +k('Rewards paid',_rfFmt(paid)+' <small style="font-size:13px">SAR</small>','added to customers\' credit')
   +k('Credit used',_rfFmt(used)+' <small style="font-size:13px">SAR</small>','as discounts in '+usedRows.length+' orders')
   +k('Unused credit',_rfFmt(unused)+' <small style="font-size:13px">SAR</small>','held by '+holders+' customers')
   +k('Link opens',opens===null?'—':opens,opens===null?'starts after the database update':'people who opened an invite link');
  // the same friend rewarded more than once
  var byFriend={};
  _rf.all.filter(_rfDone).forEach(function(x){ var f=_rf9(x.referee_phone); if(f.length===9)(byFriend[f]=byFriend[f]||[]).push(x); });
  var dupKeys=Object.keys(byFriend).filter(function(f){ return byFriend[f].length>1; });
  var dupSet={}; dupKeys.forEach(function(f){ dupSet[f]=1; });
  if(g('rf-alert')) g('rf-alert').innerHTML=dupKeys.length?('<div class="rf-alert">⚠️ <b>Check:</b> '+dupKeys.map(function(f){ var xs=byFriend[f];
      return 'friend '+_rfPhone(f)+' was rewarded '+xs.length+' times (by '+Array.from(new Set(xs.map(function(x){ return _rfPhone(x.referrer_phone); }))).join(', ')+': '+xs.map(function(x){ return _rfDate(x.approved_at||x.created_at); }).join(', ')+')'; }).join('<br/>')
      +'<br/>From now on the same friend can only earn a reward once.</div>'):'';
  // waiting for approval
  var pen=g('rf-pending');
  if(pen){
    if(!pendAll.length) pen.innerHTML='<div class="rf-empty">Nothing waiting — all done 👍</div>';
    else pen.innerHTML=pendAll.map(function(x){
      var o=_rf.orders[x.referee_order_number]||null, st=o?(o.order_status||''):'';
      var deliv=st==='delivered', canc=/^cancel/i.test(st);
      var already=!!dupSet[_rf9(x.referee_phone)]||_rf.all.some(function(y){ return y.id!==x.id&&_rfDone(y)&&_rf9(y.referee_phone)===_rf9(x.referee_phone)&&_rf9(x.referee_phone).length===9; });
      var stTxt=!o?'⚠️ Order not found':(deliv?'✅ Delivered':(canc?'❌ Cancelled':'🕐 In progress'));
      var stCol=!o||canc?'#dc2626':(deliv?'#16a34a':'#d97706');
      var oInfo='#'+escHtml(x.referee_order_number||'—')+(o?(' · '+Number(o.total||0).toFixed(2)+' SAR · '+escHtml(o.customer_name||'')):'');
      return '<div class="rf-p '+(already||canc||!o?'bad':(deliv?'ok':''))+'">'
        +'<div class="rf-grid"><div><span>Invited by</span>'+_rfPhone(x.referrer_phone)+'</div><div><span>New friend</span>'+_rfPhone(x.referee_phone)+'</div>'
        +'<div><span>Friend\'s first order</span>'+oInfo+'</div><div><span>Order status</span><b style="color:'+stCol+'">'+stTxt+'</b></div></div>'
        +(already?'<div class="rf-warn" style="background:#fee2e2;color:#991b1b">⛔ This friend was already rewarded before — please Reject.</div>'
          :(canc?'<div class="rf-warn" style="background:#fee2e2;color:#991b1b">❌ The friend\'s order was cancelled — please Reject.</div>'
            :(deliv?'':'<div class="rf-warn" style="background:#fef3c7;color:#92400e">⚠️ Not delivered yet — better to wait for “Delivered” before approving.</div>')))
        +'<div class="rf-act"><label for="rfa-'+x.id+'" style="font-size:12px;color:var(--muted,#64748b)">Reward</label>'
        +'<input id="rfa-'+x.id+'" type="number" min="0" step="0.5" value="'+_rfFmt(_rf.reward)+'"/><span style="font-size:12px;color:var(--muted,#64748b)">SAR</span>'
        +'<button class="rf-btn ok" onclick="approveRef('+x.id+')"'+(already?' disabled style="opacity:.45;cursor:not-allowed"':'')+'>✓ Approve</button>'
        +'<button class="rf-btn no" onclick="rejectRef('+x.id+')">✗ Reject</button></div></div>';
    }).join('');
  }
  // top inviters
  var acc9={}; _rf.accounts.forEach(function(a){ var p=_rf9(a.phone); if(!acc9[p])acc9[p]={bal:0,code:''}; acc9[p].bal+=Number(a.credit_balance||0); if(a.referral_code)acc9[p].code=a.referral_code; });
  var used9={}; _rf.used.forEach(function(o){ var p=_rf9(o.customer_phone); used9[p]=(used9[p]||0)+Number(o.ref_credit_used||0); });
  var opens9={}; if(_rf.visits) _rf.visits.forEach(function(v){ (opens9[v.code]=opens9[v.code]||new Set()).add(v.device); });
  var tops={}; list.forEach(function(x){ var p=_rf9(x.referrer_phone); var t=tops[p]=tops[p]||{p:p,friends:0,rewarded:0,earned:0}; t.friends++; if(_rfDone(x)){ t.rewarded++; t.earned+=Number(x.reward_sr||0); } });
  var topList=Object.keys(tops).map(function(p){ return tops[p]; }).sort(function(a,b){ return b.friends-a.friends||b.earned-a.earned; }).slice(0,10);
  if(g('rf-top')) g('rf-top').innerHTML=!topList.length?'<div class="rf-empty">No referrals in this period</div>'
    :'<table><thead><tr><th>Customer</th><th>Code</th><th>Opened link</th><th>Friends</th><th>Rewarded</th><th>Earned</th><th>Used</th><th>Balance now</th></tr></thead><tbody>'
    +topList.map(function(t){ var a=acc9[t.p]||{bal:0,code:''}; var op=_rf.visits===null?'—':((opens9[a.code]&&opens9[a.code].size)||0);
      return '<tr><td><b>'+_rfPhone(t.p)+'</b></td><td>'+escHtml(a.code||'—')+'</td><td>'+op+'</td><td>'+t.friends+'</td><td>'+t.rewarded+'</td><td>'+_rfFmt(t.earned)+' SAR</td><td>'+_rfFmt(used9[t.p]||0)+' SAR</td><td><b>'+_rfFmt(a.bal)+' SAR</b></td></tr>'; }).join('')
    +'</tbody></table>';
  // all referrals
  var groups={all:list,ok:rewarded,wait:waiting,no:rejected};
  if(g('rf-chips')) g('rf-chips').innerHTML=[['all','All'],['ok','Rewarded'],['wait','Waiting'],['no','Rejected']].map(function(c){
    return '<button class="'+(_rf.filter===c[0]?'on':'')+'" data-f="'+c[0]+'">'+c[1]+' · '+groups[c[0]].length+'</button>'; }).join('');
  var q=_rf.q.replace(/\s/g,'').toLowerCase(), qd=q.replace(/\D/g,'');
  var rows=(groups[_rf.filter]||list).filter(function(x){
    if(!q) return true;
    if(String(x.referee_order_number||'').toLowerCase().indexOf(q)>=0) return true;
    return qd.length>=3&&(String(x.referrer_phone||'').replace(/\D/g,'').indexOf(qd.replace(/^0/,''))>=0||String(x.referee_phone||'').replace(/\D/g,'').indexOf(qd.replace(/^0/,''))>=0);
  });
  if(g('rf-all')) g('rf-all').innerHTML=!rows.length?'<div class="rf-empty">No referrals found</div>'
    :'<table><thead><tr><th>Date</th><th>Invited by</th><th>Friend</th><th>Friend\'s order</th><th>Order status</th><th>Reward</th><th>Status</th></tr></thead><tbody>'
    +rows.slice(0,300).map(function(x){ var o=_rf.orders[x.referee_order_number]||null, st=o?(o.order_status||'—'):'not found';
      var dup=_rfDone(x)&&!!dupSet[_rf9(x.referee_phone)];
      var s=_rfDone(x)?['ok',x.status==='completed'?'Rewarded (old)':'Approved']:(x.status==='rejected'?['no','Rejected']:['wait','Waiting']);
      return '<tr class="'+(dup?'dup':'')+'"><td>'+_rfDate(x.created_at)+'</td><td><b>'+_rfPhone(x.referrer_phone)+'</b></td><td><b>'+_rfPhone(x.referee_phone)+'</b>'+(dup?'<span class="tag">rewarded twice</span>':'')+'</td>'
        +'<td>#'+escHtml(x.referee_order_number||'—')+(o?' · '+Number(o.total||0).toFixed(2)+' SAR':'')+'</td><td>'+escHtml(st)+'</td>'
        +'<td>'+(x.reward_sr!=null?_rfFmt(x.reward_sr)+' SAR':'—')+'</td><td><span class="st '+s[0]+'">'+s[1]+'</span></td></tr>'; }).join('')
    +'</tbody></table>'+(rows.length>300?'<div class="rf-empty">Showing the newest 300 — use search to find older ones.</div>':'');
}
(function(){
  var per=document.getElementById('rf-period');
  if(per) per.addEventListener('click',function(e){ var b=e.target.closest('button[data-p]'); if(!b)return;
    _rf.period=b.getAttribute('data-p'); Array.prototype.forEach.call(per.querySelectorAll('button'),function(x){ x.classList.toggle('on',x===b); }); renderReferralsAdmin(); });
  var ch=document.getElementById('rf-chips');
  if(ch) ch.addEventListener('click',function(e){ var b=e.target.closest('button[data-f]'); if(!b)return; _rf.filter=b.getAttribute('data-f'); renderReferralsAdmin(); });
  var qi=document.getElementById('rf-q');
  if(qi) qi.addEventListener('input',function(){ _rf.q=qi.value||''; renderReferralsAdmin(); });
})();
function _rfMissingFn(r){ var e=r&&r.error; return !!e&&(e.code==='PGRST202'||/Could not find the function/i.test(e.message||'')); }
async function approveRef(id){
  var x=_rf.all.find(function(y){ return y.id===id; })||{};
  var el=document.getElementById('rfa-'+id); var amt=Number(el?el.value:NaN);
  if(!(amt>=0)||amt>1000){ alert('Enter a correct amount'); return; }
  if(!confirm('Give '+_rfFmt(amt)+' SAR to '+_rfPhone(x.referrer_phone)+'?')) return;
  try{
    var r=await sb.rpc('referral_approve',{p_id:id,p_amount:amt});
    if(_rfMissingFn(r)){   // database not updated yet → the old way
      var p=String(x.referrer_phone||'');
      var a=await sb.from('referral_accounts').select('credit_balance').eq('phone',p).limit(1); var acc=(a.data&&a.data[0])||null;
      if(acc) await sb.from('referral_accounts').update({credit_balance:Number(acc.credit_balance||0)+amt}).eq('phone',p);
      else await sb.from('referral_accounts').insert([{phone:p,credit_balance:amt}]);
      await sb.from('referrals').update({status:'approved',reward_sr:amt,approved_at:new Date().toISOString()}).eq('id',id);
      showToast('✓ Approved — '+_rfFmt(amt)+' SAR'); loadReferralsAdmin(); return;
    }
    if(r.error) throw r.error;
    var d=r.data||{};
    if(d.ok){ showToast('✓ Approved — '+_rfFmt(d.amount)+' SAR added'); }
    else if(d.error==='friend_already_rewarded'){ alert('This friend was already rewarded before. Please reject this one.'); }
    else if(d.error==='not_pending'){ showToast('Already handled'); }
    else if(d.error==='bad_amount'){ alert('Enter a correct amount'); return; }
    else { alert('Could not approve ('+(d.error||'error')+')'); }
    loadReferralsAdmin();
  }catch(e){ alert('Error, please try again'); }
}
async function rejectRef(id){
  if(!confirm('Reject this referral?')) return;
  try{
    var r=await sb.rpc('referral_reject',{p_id:id});
    if(_rfMissingFn(r)){ await sb.from('referrals').update({status:'rejected',approved_at:new Date().toISOString()}).eq('id',id); }
    else if(r.error) throw r.error;
    showToast('Rejected'); loadReferralsAdmin();
  }catch(e){ alert('Error, please try again'); }
}
async function saveRefReward(){
  var v=Number(document.getElementById('rf-reward-set').value);
  if(!(v>=0)||v>100){ alert('Enter an amount between 0 and 100 SAR'); return; }
  try{
    var r=await sb.from('settings').upsert([{key:'referral_reward_sr',value:_rfFmt(v)}],{onConflict:'key'});
    if(r.error) throw r.error;
    _rf.reward=v; showToast('✓ Saved — customers now see '+_rfFmt(v)+' SAR per friend'); renderReferralsAdmin();
  }catch(e){ alert('Could not save, please try again'); }
}
try{ setTimeout(loadReferralsAdmin,1500); }catch(e){} // populate the sidebar pending badge on load
