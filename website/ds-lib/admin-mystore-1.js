/* Delivery Step Admin → My store (the owner's own shop).
   Loaded by admin.html the first time My store is opened (see _lazy in admin.html).
   Keep the file name versioned (admin-mystore-1.js, -2.js …): files in ds-lib are cached for a year. */
(function(){
  var st=document.createElement('style'); st.id='dss-css'; st.textContent="/* ── Delivery Step Store (My store) ── */\n.dss-hd{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;max-width:1140px}\n.dss-logo{width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#4c1d95);display:flex;align-items:center;justify-content:center;font-size:24px;overflow:hidden;flex-shrink:0}\n.dss-logo img{width:100%;height:100%;object-fit:cover}\n.dss-hd h2{font-size:18px;font-weight:800}.dss-hd p{font-size:12px;color:var(--muted)}\n.dss-btn{border:1px solid var(--border);background:var(--white);border-radius:9px;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;color:var(--text);text-decoration:none;display:inline-flex;align-items:center;gap:5px;white-space:nowrap}\n.dss-btn.p{background:#7c3aed;border-color:#7c3aed;color:#fff}.dss-btn.g{background:#16a34a;border-color:#16a34a;color:#fff}.dss-btn.sm{padding:4px 9px;font-size:11.5px}\n.dss-btn:disabled{opacity:.5;cursor:default}\n.dss-state{font-size:11px;font-weight:800;border-radius:20px;padding:3px 10px}\n.dss-state.on{background:#dcfce7;color:#15803d}.dss-state.off{background:#fee2e2;color:#b91c1c}.dss-state.hid{background:#f1f5f9;color:#475569}\n.dss-tabs{display:flex;gap:2px;border-bottom:1px solid var(--border);margin-bottom:14px;overflow-x:auto;max-width:1140px;scrollbar-width:none}\n.dss-tabs::-webkit-scrollbar{display:none}\n.dss-tabs button{border:none;background:none;padding:9px 13px;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;font-family:inherit}\n.dss-tabs button.on{color:#7c3aed;border-color:#7c3aed}\n.dss-tabs b{font-size:10px;background:#fef2f2;color:#b91c1c;border-radius:8px;padding:1px 6px;margin-left:4px}\n.dss-pane{display:none;max-width:1140px}.dss-pane.on{display:block}\n.dss-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}\n.dss-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:12px}\n.dss-k{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:12px 14px;min-width:0}\n.dss-k .l{font-size:11.5px;color:var(--muted);font-weight:600}.dss-k .n{font-size:24px;font-weight:800;margin-top:3px;font-variant-numeric:tabular-nums}.dss-k .n small{font-size:12px;color:var(--muted);font-weight:600}\n.dss-k .s{font-size:11px;color:var(--muted);font-weight:600}.dss-up{color:#15803d}.dss-down{color:#b91c1c}\n.dss-k.hero{background:linear-gradient(135deg,#f0fdf4,var(--white));border-color:#bbf7d0}.dss-k.hero .n{color:#15803d}\n.dss-card{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:14px;min-width:0}\n.dss-card h3{font-size:14px;font-weight:800}.dss-card .hs{font-size:11.5px;color:var(--muted);margin-bottom:10px}\n.dss-cols{display:grid;grid-template-columns:1.4fr 1fr;gap:12px;margin-bottom:12px;align-items:start}\n.dss-cols2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;align-items:start}\n.dss-att{background:var(--white);border:1.5px solid #fde68a;border-radius:12px;padding:12px 14px;margin-bottom:12px}\n.dss-att:empty{display:none}\n.dss-att h3{font-size:14px;font-weight:800;display:flex;gap:8px;align-items:center}\n.dss-ai{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--border);font-size:12.5px;flex-wrap:wrap}\n.dss-ai:first-of-type{border-top:none}\n.dss-ai .t{flex:1;min-width:180px}.dss-ai .m{color:var(--muted);font-size:11.5px}\n.dss-pill{font-size:10.5px;font-weight:800;border-radius:6px;padding:2px 7px;white-space:nowrap;display:inline-block}\n.dss-pill.r{background:#fef2f2;color:#b91c1c}.dss-pill.a{background:#fffbeb;color:#92400e}.dss-pill.g{background:#f1f5f9;color:#475569}.dss-pill.ok{background:#f0fdf4;color:#15803d}.dss-pill.b{background:#eff6ff;color:#1d4ed8}\n.dss-ar{font-family:'Tajawal',sans-serif;direction:rtl;unicode-bidi:isolate}\n.dss-chart{position:relative;height:240px;display:flex;align-items:flex-end;gap:8px;padding:0 2px 22px;border-bottom:1px solid var(--border)}\n.dss-bw{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;position:relative;min-width:0}\n.dss-bar{width:100%;max-width:46px;background:#8b5cf6;border-radius:4px 4px 0 0;position:relative;min-height:2px}\n.dss-bar i{position:absolute;left:0;right:0;bottom:0;background:#4c1d95}\n.dss-bw .d{position:absolute;bottom:-20px;font-size:10px;color:var(--muted);white-space:nowrap}\n.dss-bw .v{font-size:10px;font-weight:700;color:var(--text);margin-bottom:3px;font-variant-numeric:tabular-nums;white-space:nowrap}\n.dss-tip{position:absolute;bottom:100%;margin-bottom:6px;background:#0f172a;color:#fff;border-radius:8px;padding:6px 9px;font-size:11px;white-space:nowrap;display:none;z-index:3;line-height:1.5;pointer-events:none}\n.dss-bw:hover .dss-tip{display:block}.dss-bw:hover .dss-bar{filter:brightness(1.08)}\n.dss-lg{display:flex;gap:14px;font-size:11.5px;color:var(--muted);margin-top:8px}.dss-lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}\n.dss-dep{margin-bottom:12px}.dss-dep .h{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;font-weight:700;flex-wrap:wrap}.dss-dep .h span{color:var(--muted);font-weight:600}\n.dss-track{height:9px;background:#f1f5f9;border-radius:5px;margin-top:3px;overflow:hidden}.dss-track i{display:block;height:100%;border-radius:5px}\n.dss-sub{font-size:10.5px;color:var(--muted);margin-top:4px}\n.dss-insight{background:#f5f3ff;border-radius:10px;padding:10px 12px;font-size:12px;color:#4c1d95;line-height:1.6}\n.dss-t{width:100%;border-collapse:collapse;font-size:12.5px}\n.dss-t th{text-align:left;font-size:11px;color:var(--muted);font-weight:700;padding:7px 8px;border-bottom:1px solid var(--border);white-space:nowrap;background:var(--white);position:sticky;top:0}\n.dss-t td{padding:7px 8px;border-bottom:1px solid var(--border);white-space:nowrap;font-variant-numeric:tabular-nums;vertical-align:middle}\n.dss-t td.nm{white-space:normal;min-width:160px}\n.dss-t tr:last-child td{border-bottom:none}\n.dss-t .num{text-align:right}\n.dss-t tr.hid td{opacity:.55}\n.dss-rk{width:22px;height:22px;border-radius:7px;background:#f1f5f9;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#334155}\n.dss-mini{height:6px;background:#f1f5f9;border-radius:3px;width:70px;display:inline-block;vertical-align:middle;overflow:hidden}.dss-mini i{display:block;height:100%;background:#7c3aed;border-radius:3px}\n.dss-scroll{overflow-x:auto}\n.dss-th{width:32px;height:32px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:15px;vertical-align:middle;margin-right:8px;overflow:hidden;background:#f5f3ff;flex-shrink:0}\n.dss-th img{width:100%;height:100%;object-fit:cover}\n.dss-th.cd{color:#fff;font-size:10px;font-weight:900;font-family:system-ui}\n.dss-nmw{display:flex;align-items:center}\n.dss-in{width:74px;border:1px solid var(--border);border-radius:7px;padding:4px 6px;font-size:12.5px;font-family:inherit;text-align:right;background:var(--white);color:var(--text)}\n.dss-in:focus{outline:none;border-color:#7c3aed;box-shadow:0 0 0 2px #ede9fe}\n.dss-in.saved{border-color:#16a34a;box-shadow:0 0 0 2px #dcfce7}\n.dss-in.miss{border-color:#f59e0b;background:#fffbeb}\n.dss-hrs{display:flex;align-items:flex-end;gap:3px;height:80px}\n.dss-hrs i{flex:1;background:#ddd6fe;border-radius:3px 3px 0 0;min-height:2px}.dss-hrs i.pk{background:#7c3aed}\n.dss-hrl{display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:4px}\n.dss-buy{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px;font-size:12.5px}\n.dss-empty{font-size:12.5px;color:var(--muted);padding:18px 0;text-align:center;line-height:1.7}\n.dss-setup{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:18px;max-width:640px}\n.dss-setup h3{font-size:16px;font-weight:800;margin-bottom:4px}\n.dss-steps{font-size:12.5px;color:var(--muted);line-height:1.8;margin:8px 0 14px;padding-left:18px}\n.dss-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n.dss-f label{font-size:11px;font-weight:700;color:var(--muted);display:block;margin-bottom:3px}\n.dss-f input,.dss-f select,.dss-f textarea{width:100%;box-sizing:border-box;border:1px solid var(--border);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit;background:var(--white);color:var(--text)}\n.dss-f textarea{min-height:70px;resize:vertical}\n.dss-f .h{font-size:10.5px;color:var(--muted);margin-top:3px}\n.dss-sw{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;background:var(--white)}\n.dss-sw input{width:18px;height:18px;accent-color:#7c3aed}\n.dss-sw small{display:block;font-weight:500;color:var(--muted);font-size:11px}\n.dss-msg{font-size:12px;margin-top:8px;min-height:16px}\n.dss-dimg{width:100%;height:110px;border:1.5px dashed var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);font-size:12px;overflow:hidden;background:var(--bg)}\n.dss-dimg img{width:100%;height:100%;object-fit:contain}\n.dss-gift-row td{background:#f8faff;border-top:none!important;padding:8px 10px 12px!important}\n.dss-gift{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:12px;color:var(--muted);position:sticky;left:0;max-width:min(100%,calc(100vw - 72px));white-space:normal}\n.dss-gift label{display:flex;flex-direction:column;gap:3px;font-weight:700}\n.dss-gpic{width:52px;height:52px;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;flex-shrink:0}\n.dss-gpic img{width:100%;height:100%;object-fit:cover}\n.dss-gprev{position:relative;width:150px;aspect-ratio:1.6/1;border-radius:9px;overflow:hidden;color:#fff;direction:ltr;container-type:inline-size;flex-shrink:0}\n.dss-gprev .t{position:absolute;top:7%;right:6%;max-width:62%;font:900 9cqw/1 Impact,'Arial Black',system-ui,sans-serif;white-space:nowrap;overflow:hidden}\n.dss-gprev .e{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font-size:22cqw;line-height:1}\n.dss-gprev .b{position:absolute;left:5%;right:5%;bottom:8%;height:24%;border-radius:6px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:flex-end;padding:0 7%;font:800 9cqw/1 system-ui,sans-serif;white-space:nowrap}\n.dss-gphoto{position:relative;width:150px;aspect-ratio:1.74/1;border-radius:7%/12%;overflow:hidden;background:#0b1d5c center/cover no-repeat;color:#fff;direction:ltr;container-type:inline-size;transform:rotate(-7deg);box-shadow:0 6px 12px rgba(30,27,75,.3);flex-shrink:0;margin:6px 8px}\n.dss-gphoto .b{position:absolute;left:5%;right:5%;top:77.5%;height:17%;display:flex;align-items:center;justify-content:space-between;padding:0 4% 0 5%}\n.dss-gphoto .b i{font-style:normal;font-size:9.5cqw;line-height:1}.dss-gphoto .b span{font:800 8.5cqw/1 system-ui,sans-serif;text-shadow:0 1px 2px rgba(0,0,0,.5);white-space:nowrap}\n.dss-rprev{position:relative;width:150px;aspect-ratio:1.6/1;border-radius:9%/14%;overflow:hidden;color:#fff;direction:ltr;container-type:inline-size;transform:rotate(-7deg);box-shadow:0 6px 12px rgba(30,27,75,.3);flex-shrink:0;margin:6px 8px}\n.dss-rprev .co{position:absolute;top:9%;left:7%;max-width:60%;font:900 12cqw/1 system-ui,sans-serif;white-space:nowrap;overflow:hidden}\n.dss-rprev .sim{position:absolute;top:11%;right:8%;width:16%;aspect-ratio:1.3/1;border-radius:3px;background:linear-gradient(135deg,#fde68a,#d97706)}\n.dss-rprev .tp{position:absolute;left:7%;top:33%;font:800 6.5cqw/1 Tajawal,system-ui;direction:rtl;opacity:.85}\n.dss-rprev .ra{position:absolute;left:7%;bottom:10%;font:900 22cqw/1 system-ui,sans-serif}.dss-rprev .ra small{font-size:8cqw;margin-left:2%}\n.dss-packs{flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:2px}\n.dss-packs .lb{font-weight:800;color:var(--text);font-size:12px;margin-right:2px}\n.dss-pk{border:1px solid var(--border);background:var(--white);border-radius:9px;padding:5px 9px;font-size:12px;font-weight:700;color:var(--text);cursor:pointer;font-family:inherit}\n.dss-pk small{color:var(--muted);font-weight:600;margin-left:4px}.dss-pk.out{opacity:.5;text-decoration:line-through}\n.dss-pk.add{border-style:dashed;border-color:#a78bfa;color:#6d28d9;background:#faf5ff}\n.dss-dep-ic{width:34px;text-align:center;font-size:18px;border:1px solid var(--border);border-radius:7px;padding:3px;background:var(--white);color:var(--text)}\n@media(max-width:900px){.dss-kpis{grid-template-columns:1fr 1fr}.dss-cols,.dss-cols2{grid-template-columns:1fr}.dss-k .n{font-size:20px}.dss-chart{gap:4px}.dss-bw .v{font-size:9px}.dss-grid2{grid-template-columns:1fr}}\n[data-theme=\"dark\"] .dss-pill.g,[data-theme=\"dark\"] .dss-rk,[data-theme=\"dark\"] .dss-track,[data-theme=\"dark\"] .dss-mini{background:#334155;color:#cbd5e1}\n[data-theme=\"dark\"] .dss-insight{background:#2e1065;color:#ddd6fe}\n[data-theme=\"dark\"] .dss-k.hero{background:#052e16;border-color:#166534}";
  document.head.appendChild(st);
  document.getElementById('section-dsstore').innerHTML="        <div class=\"dss-hd\">\n          <div class=\"dss-logo\" id=\"dss-logo\">📱</div>\n          <div style=\"flex:1;min-width:200px\"><h2>Delivery Step Store <span class=\"dss-ar\" style=\"font-size:14px;color:var(--muted)\" id=\"dss-title-ar\">متجر خطوة التوصيل</span> <span class=\"dss-state\" id=\"dss-state\"></span></h2>\n            <p>Your own shop: you buy the stock, you keep the profit. Here you see <b>what you earn</b> and <b>what to buy next</b>.</p></div>\n          <a class=\"dss-btn\" href=\"/shop?preview=1\" target=\"_blank\" rel=\"noopener\" id=\"dss-open\"><i class=\"ti ti-external-link\"></i> Open store page</a>\n          <button type=\"button\" class=\"dss-btn p\" id=\"dss-add\" onclick=\"dssEdit(null)\"><i class=\"ti ti-plus\"></i> Add product</button>\n        </div>\n        <div id=\"dss-setup\" style=\"display:none\"></div>\n        <div id=\"dss-body\" style=\"display:none\">\n          <div class=\"dss-tabs\" id=\"dss-tabs\">\n            <button type=\"button\" class=\"on\" data-p=\"ov\" onclick=\"dssTab('ov')\">📊 Overview</button>\n            <button type=\"button\" data-p=\"pr\" onclick=\"dssTab('pr')\">📦 Products &amp; profit</button>\n            <button type=\"button\" data-p=\"st\" onclick=\"dssTab('st')\">🧮 Stock &amp; buying <b id=\"dss-st-badge\" style=\"display:none\"></b></button>\n            <button type=\"button\" data-p=\"dp\" onclick=\"dssTab('dp')\">🗂 Departments</button>\n            <button type=\"button\" data-p=\"or\" onclick=\"dssTab('or')\">🧾 Orders</button>\n            <button type=\"button\" data-p=\"se\" onclick=\"dssTab('se')\">⚙️ Store settings</button>\n          </div>\n\n          <div class=\"dss-pane on\" id=\"dss-p-ov\">\n            <div class=\"dss-row\">\n              <div class=\"sr-seg\" id=\"dss-seg\"><button type=\"button\" data-d=\"1\" onclick=\"dssPeriod(1)\">Today</button><button type=\"button\" data-d=\"7\" class=\"on\" onclick=\"dssPeriod(7)\">7 days</button><button type=\"button\" data-d=\"30\" onclick=\"dssPeriod(30)\">30 days</button></div>\n              <span style=\"font-size:11.5px;color:var(--muted)\" id=\"dss-range\"></span>\n              <button type=\"button\" class=\"tb-btn\" onclick=\"loadDsStore()\"><i class=\"ti ti-refresh\"></i> Refresh</button>\n            </div>\n            <div class=\"dss-kpis\">\n              <div class=\"dss-k\"><div class=\"l\">💰 Sales</div><div class=\"n\" id=\"dss-k-sales\">—</div><div class=\"s\" id=\"dss-k-sales-s\"></div></div>\n              <div class=\"dss-k hero\"><div class=\"l\">✅ Your profit (after buying cost)</div><div class=\"n\" id=\"dss-k-profit\">—</div><div class=\"s\" id=\"dss-k-profit-s\"></div></div>\n              <div class=\"dss-k\"><div class=\"l\">🧾 Orders</div><div class=\"n\" id=\"dss-k-orders\">—</div><div class=\"s\" id=\"dss-k-orders-s\"></div></div>\n              <div class=\"dss-k\"><div class=\"l\">👥 Customers</div><div class=\"n\" id=\"dss-k-cust\">—</div><div class=\"s\" id=\"dss-k-cust-s\"></div></div>\n            </div>\n            <div class=\"dss-att\" id=\"dss-att\"></div>\n            <div class=\"dss-cols\">\n              <div class=\"dss-card\"><h3>Sales per day</h3><div class=\"hs\">Dark part = your profit. Point at a day for details.</div><div class=\"dss-chart\" id=\"dss-days\"></div>\n                <div class=\"dss-lg\"><span><i style=\"background:#8b5cf6\"></i>Sales</span><span><i style=\"background:#4c1d95\"></i>Profit inside it</span></div></div>\n              <div class=\"dss-card\"><h3>Where the money comes from</h3><div class=\"hs\">Share of sales vs share of profit, by department.</div><div id=\"dss-deps\"></div><div id=\"dss-insight\"></div></div>\n            </div>\n            <div class=\"dss-cols2\">\n              <div class=\"dss-card\"><h3>🏆 Best sellers</h3><div class=\"hs\">By pieces sold in the period.</div><div class=\"dss-scroll\"><table class=\"dss-t\" id=\"dss-best\"></table></div></div>\n              <div class=\"dss-card\"><h3>💎 Most profit</h3><div class=\"hs\">The items that actually make you money.</div><div class=\"dss-scroll\"><table class=\"dss-t\" id=\"dss-prof\"></table></div></div>\n            </div>\n            <div class=\"dss-cols2\">\n              <div class=\"dss-card\"><h3>🕒 Busy hours</h3><div class=\"hs\">When store orders come in — keep stock and a rider ready.</div><div class=\"dss-hrs\" id=\"dss-hrs\"></div><div class=\"dss-hrl\"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span></div><div style=\"font-size:12px;margin-top:8px\" id=\"dss-busy\"></div></div>\n              <div class=\"dss-card\"><h3>📶 Recharge cards by company</h3><div class=\"hs\">Cards sold in the period.</div><div id=\"dss-car\"></div></div>\n            </div>\n          </div>\n\n          <div class=\"dss-pane\" id=\"dss-p-pr\">\n            <div class=\"dss-row\">\n              <div class=\"sr-seg\" id=\"dss-pr-dep\"></div>\n              <input type=\"search\" class=\"dss-in\" id=\"dss-pr-q\" placeholder=\"Search…\" style=\"width:180px;text-align:left\" oninput=\"dssRenderProducts()\">\n              <span style=\"font-size:11.5px;color:var(--muted)\">Type the <b>buying cost</b> once → profit is calculated on every order. Customers never see it. Changes save by themselves.</span>\n            </div>\n            <div class=\"dss-card dss-scroll\"><table class=\"dss-t\" id=\"dss-ptab\"></table></div>\n          </div>\n\n          <div class=\"dss-pane\" id=\"dss-p-st\">\n            <div class=\"dss-card\">\n              <h3>🧮 Buying list — enough stock for the next 2 weeks</h3>\n              <div class=\"hs\">The count goes down by itself when a customer orders (and back up if the order is cancelled). At 0 the product shows “نفذت الكمية” to customers automatically. Use <b>＋ Received</b> when new stock arrives.</div>\n              <div class=\"dss-scroll\"><table class=\"dss-t\" id=\"dss-stab\"></table></div>\n              <div class=\"dss-buy\"><span id=\"dss-buy-t\"></span><button type=\"button\" class=\"dss-btn g\" onclick=\"dssCopyBuy()\"><i class=\"ti ti-brand-whatsapp\"></i> Copy list for WhatsApp</button></div>\n            </div>\n          </div>\n\n          <div class=\"dss-pane\" id=\"dss-p-dp\">\n            <div class=\"dss-card\" style=\"margin-bottom:12px;background:#faf9ff\">\n              <h3>🗂 Your store has 3 kinds of departments</h3>\n              <div class=\"hs\" style=\"line-height:1.7\">Each box below is one big button on the store page. A department shows to customers only when it has products.<br>\n                <b>📶 Recharge cards</b> — one row per phone company · <b>🎮 Gift cards &amp; games</b> — one row per game or store · <b>🛍️ Other departments</b> — chargers, headphones, cases…</div>\n            </div>\n            <div class=\"dss-card dss-grp\" style=\"border-top:4px solid #7c3aed;margin-bottom:12px\">\n              <h3>📶 Recharge cards <span class=\"dss-ar\" style=\"font-weight:700;color:var(--muted)\">شحن رصيد</span> <small id=\"dss-grp-rc-n\" style=\"font-weight:600;color:var(--muted);font-size:12px\"></small></h3>\n              <div class=\"hs\">One row = <b>one phone company</b> (stc, Mobily, Zain, Lebara…) — upload its <b>logo</b>. Its products are the <b>amounts</b>: name <span dir=\"rtl\">“شحن 20”</span> + price.\n                Customers tap the company → the amount → card delivered by the rider, or a photo on WhatsApp. Empty fields = automatic. An older mixed row (<span dir=\"rtl\">“شحن stc 20”، “شحن زين 30”</span>) still works and is split by the names.</div>\n              <div class=\"dss-scroll\"><table class=\"dss-t\" id=\"dss-dtab-rc\"></table></div>\n              <div style=\"display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center\"><input class=\"dss-dep-ic\" id=\"dss-nd-ic-rc\" value=\"📶\" maxlength=\"4\" aria-label=\"Icon\"><input class=\"dss-in dss-ar\" id=\"dss-nd-name-rc\" placeholder=\"اسم الشركة — مثل: زين\" style=\"width:200px;text-align:right\"><button type=\"button\" class=\"dss-btn p\" onclick=\"dssAddDep('rc')\"><i class=\"ti ti-plus\"></i> Add company</button></div>\n            </div>\n            <div class=\"dss-card dss-grp\" style=\"border-top:4px solid #0ea5e9;margin-bottom:12px\">\n              <h3>🎮 Gift cards &amp; games <span class=\"dss-ar\" style=\"font-weight:700;color:var(--muted)\">بطاقات وألعاب</span> <small id=\"dss-grp-gift-n\" style=\"font-weight:600;color:var(--muted);font-size:12px\"></small></h3>\n              <div class=\"hs\">One row = <b>one game or store</b> (Free Fire, PUBG, PlayStation, Apple…) — upload its <b>picture</b> and, if you have it, the <b>real card picture</b>. Its products are the <b>packs</b>: name with the number (<span dir=\"rtl\">“530 جوهرة”</span>, <span dir=\"rtl\">“60 شدة”</span>, “20$”) + price.\n                Customers get the <b>code on WhatsApp</b> after a bank transfer (no rider, no delivery fee). Empty fields = automatic. Card picture = the real card with an empty bar at the bottom — its black border is cut off by itself; the icon and each pack’s number are written on the bar.</div>\n              <div class=\"dss-scroll\"><table class=\"dss-t\" id=\"dss-dtab-gift\"></table></div>\n              <div style=\"display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center\"><input class=\"dss-dep-ic\" id=\"dss-nd-ic-gift\" value=\"🎮\" maxlength=\"4\" aria-label=\"Icon\"><input class=\"dss-in dss-ar\" id=\"dss-nd-name-gift\" placeholder=\"اسم اللعبة أو المتجر — مثل: ببجي\" style=\"width:200px;text-align:right\"><button type=\"button\" class=\"dss-btn p\" onclick=\"dssAddDep('gift')\"><i class=\"ti ti-plus\"></i> Add brand</button></div>\n            </div>\n            <div class=\"dss-card dss-grp\" style=\"border-top:4px solid #16a34a\">\n              <h3>🛍️ Other departments <span class=\"dss-ar\" style=\"font-weight:700;color:var(--muted)\">أقسام المتجر</span> <small id=\"dss-grp-n-n\" style=\"font-weight:600;color:var(--muted);font-size:12px\"></small></h3>\n              <div class=\"hs\">Normal products delivered by the rider: chargers, cables, headphones, cases…</div>\n              <div class=\"dss-scroll\"><table class=\"dss-t\" id=\"dss-dtab\"></table></div>\n              <div style=\"display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center\"><input class=\"dss-dep-ic\" id=\"dss-nd-ic\" value=\"🛍️\" maxlength=\"4\" aria-label=\"Icon\"><input class=\"dss-in dss-ar\" id=\"dss-nd-name\" placeholder=\"اسم القسم\" style=\"width:200px;text-align:right\"><button type=\"button\" class=\"dss-btn p\" onclick=\"dssAddDep('n')\"><i class=\"ti ti-plus\"></i> Add department</button></div>\n            </div>\n          </div>\n\n          <div class=\"dss-pane\" id=\"dss-p-or\">\n            <div class=\"dss-card dss-scroll\"><h3>🧾 Store orders</h3><div class=\"hs\">Only the store part of each order (the period above). Profit is shown per order. Cancelled orders are not counted.</div><table class=\"dss-t\" id=\"dss-otab\"></table></div>\n          </div>\n\n          <div class=\"dss-pane\" id=\"dss-p-se\">\n            <div class=\"dss-card\" style=\"max-width:720px\">\n              <h3>⚙️ Store settings</h3><div class=\"hs\">How the store shows to customers.</div>\n              <div class=\"dss-grid2\" style=\"margin-bottom:10px\">\n                <label class=\"dss-sw\"><input type=\"checkbox\" id=\"dss-s-active\"><span>Show the store to customers<small>Home card + store page. Off = hidden completely.</small></span></label>\n                <label class=\"dss-sw\"><input type=\"checkbox\" id=\"dss-s-open\"><span>Open for orders now<small>Off = customers can look but not order.</small></span></label>\n              </div>\n              <div class=\"dss-grid2\">\n                <div class=\"dss-f\"><label>Store name</label><input id=\"dss-s-name\" class=\"dss-ar\"></div>\n                <div class=\"dss-f\"><label>WhatsApp number (orders / \"ask us\")</label><input id=\"dss-s-wa\" dir=\"ltr\" placeholder=\"9665XXXXXXXX\"></div>\n                <div class=\"dss-f\"><label>Delivery fee (SAR)</label><input id=\"dss-s-fee\" type=\"number\" min=\"0\" step=\"0.5\"></div>\n                <div class=\"dss-f\"><label>Delivery time (minutes)</label><input id=\"dss-s-time\" placeholder=\"20-30\"></div>\n                <div class=\"dss-f\"><label>Opens at</label><input id=\"dss-s-ot\" type=\"time\"></div>\n                <div class=\"dss-f\"><label>Closes at</label><input id=\"dss-s-ct\" type=\"time\"></div>\n                <label class=\"dss-sw\"><input type=\"checkbox\" id=\"dss-s-24\"><span>Open 24 hours</span></label>\n                <div class=\"dss-f\"><label>Logo (store page)</label><div class=\"dss-dimg\" id=\"dss-s-logo\" onclick=\"document.getElementById('dss-s-logo-in').click()\" style=\"height:64px\">Upload logo</div><input type=\"file\" id=\"dss-s-logo-in\" accept=\"image/*\" style=\"display:none\" onchange=\"dssPickLogo(this)\"></div>\n                <div class=\"dss-f\" style=\"grid-column:1/-1\"><label>Home card picture (phone &amp; accessories photo)</label>\n                  <div style=\"display:flex;gap:10px;align-items:center;flex-wrap:wrap\"><div class=\"dss-dimg\" id=\"dss-s-card\" onclick=\"document.getElementById('dss-s-card-in').click()\" style=\"width:110px;height:110px;flex-shrink:0;border-radius:24px\"></div>\n                  <div style=\"font-size:11.5px;color:var(--muted);line-height:1.6;flex:1;min-width:180px\">Shown on the home page card “جوالات وشحن”. Use a <b>square</b> photo (e.g. 600 × 600) with the phone and accessories <b>big in the middle</b>. Tap the picture to upload.<br><button type=\"button\" class=\"dss-btn sm\" style=\"margin-top:6px\" onclick=\"dssCardDefault()\">Use the built-in picture</button></div></div>\n                  <input type=\"file\" id=\"dss-s-card-in\" accept=\"image/*\" style=\"display:none\" onchange=\"dssPickCard(this)\"></div>\n              </div>\n              <div style=\"border-top:1px solid var(--border);margin-top:14px;padding-top:12px\">\n                <h3 style=\"font-size:13.5px;font-weight:800\">📲 Recharge card photo on WhatsApp</h3>\n                <div class=\"hs\" style=\"margin-bottom:8px\">Customers choose: 🛵 card delivered (normal delivery fee) or 📲 card photo (service fee, <b>no delivery fee</b>). Photo orders are paid by <b>bank transfer first</b> and arrive as <b>⚠️ Check first</b> in Orders (riders are not alerted): check the transfer → send the card photo on WhatsApp → tap ✅ Delivered.</div>\n                <div class=\"dss-grid2\">\n                  <label class=\"dss-sw\" style=\"grid-column:1/-1\"><input type=\"checkbox\" id=\"dss-d-on\"><span>Offer the card photo option<small>Off = cards are only delivered by the rider.</small></span></label>\n                  <div class=\"dss-f\"><label>Service fee per card (SAR)</label><input id=\"dss-d-fee\" type=\"number\" min=\"0\" step=\"0.5\" value=\"1\"></div>\n                  <div class=\"dss-f\"><label>STC Pay number (optional, shown with your bank account)</label><input id=\"dss-d-stc\" dir=\"ltr\" placeholder=\"05XXXXXXXX\"></div>\n                </div>\n              </div>\n              <button type=\"button\" class=\"btn-primary\" style=\"margin-top:12px\" id=\"dss-s-save\" onclick=\"dssSaveSettings()\"><i class=\"ti ti-check\"></i> Save settings</button>\n              <div class=\"dss-msg\" id=\"dss-s-msg\"></div>\n            </div>\n          </div>\n        </div>";
  var m=document.createElement('div'); m.innerHTML="<div class=\"modal-backdrop\" id=\"modal-dss\">\n<div class=\"modal\" style=\"max-width:620px\">\n  <div class=\"modal-head\"><span class=\"modal-title\" id=\"dss-m-title\">Add product</span><button class=\"modal-close\" onclick=\"closeModal('modal-dss')\"><i class=\"ti ti-x\"></i></button></div>\n  <div class=\"dss-grid2\">\n    <div class=\"dss-f\" style=\"grid-column:1/-1\"><label>Product name (Arabic, as customers see it)</label><input id=\"dss-m-name\" class=\"dss-ar\" placeholder=\"شحن stc سوا 50 ريال\"><div class=\"h\" id=\"dss-m-name-h\">Recharge cards: write the company + amount, e.g. “شحن stc سوا 50 ريال”, “شحن موبايلي 30 ريال”, “شحن زين 50 ريال”.</div></div>\n    <div class=\"dss-f\"><label>Department</label><select id=\"dss-m-dep\" class=\"dss-ar\" onchange=\"dssDepHint()\"></select><div id=\"dss-m-dephint\" style=\"font-size:11.5px;color:#6d28d9;margin-top:4px;line-height:1.5\"></div></div>\n    <div class=\"dss-f\"><label>Selling price (SAR)</label><input id=\"dss-m-price\" type=\"number\" min=\"0\" step=\"0.5\" oninput=\"dssProfitHint()\"></div>\n    <div class=\"dss-f\"><label>Discount price (optional)</label><input id=\"dss-m-disc\" type=\"number\" min=\"0\" step=\"0.5\" oninput=\"dssProfitHint()\"><div class=\"h\">Shows as an offer with the old price crossed out.</div></div>\n    <div class=\"dss-f\"><label>Buying cost (SAR) — secret</label><input id=\"dss-m-cost\" type=\"number\" min=\"0\" step=\"0.01\" oninput=\"dssProfitHint()\"><div class=\"h\" id=\"dss-m-profit\"></div></div>\n    <div class=\"dss-f\"><label>Pieces in stock</label><input id=\"dss-m-stock\" type=\"number\" step=\"1\" placeholder=\"empty = don't count\"><div class=\"h\">Goes down by itself with each order.</div></div>\n    <div class=\"dss-f\"><label>Warn me when stock is at</label><input id=\"dss-m-low\" type=\"number\" min=\"0\" step=\"1\" value=\"3\"></div>\n    <div class=\"dss-f\" style=\"grid-column:1/-1\"><label>Short description (optional)</label><input id=\"dss-m-desc\" class=\"dss-ar\" placeholder=\"Type-C · شحن سريع\"></div>\n    <div class=\"dss-f\"><label>Photo</label><div class=\"dss-dimg\" id=\"dss-m-img\" onclick=\"document.getElementById('dss-m-img-in').click()\">Upload photo (square looks best)</div><input type=\"file\" id=\"dss-m-img-in\" accept=\"image/*\" style=\"display:none\" onchange=\"dssPickImg(this)\"></div>\n    <div style=\"display:flex;flex-direction:column;gap:8px\">\n      <label class=\"dss-sw\"><input type=\"checkbox\" id=\"dss-m-instock\" checked><span>Available<small>Off = shows “نفذت الكمية”</small></span></label>\n      <label class=\"dss-sw\"><input type=\"checkbox\" id=\"dss-m-active\" checked><span>Visible in the store<small>Off = hidden (nothing is deleted)</small></span></label>\n    </div>\n    <div style=\"grid-column:1/-1\">\n      <label class=\"dss-sw\"><input type=\"checkbox\" id=\"dss-m-mod\" onchange=\"document.getElementById('dss-m-mod-box').style.display=this.checked?'':'none'\"><span>Customer must choose the phone model<small>For cases and screen protectors.</small></span></label>\n      <div id=\"dss-m-mod-box\" style=\"display:none;margin-top:8px\" class=\"dss-f\"><label>Phone models — one per line (add “ + 5” for an extra price)</label><textarea id=\"dss-m-mods\" dir=\"ltr\" placeholder=\"iPhone 16 Pro Max&#10;iPhone 16 / 15&#10;Galaxy S24 + 5\"></textarea></div>\n    </div>\n  </div>\n  <div class=\"err-msg\" id=\"dss-m-err\"></div>\n  <button class=\"btn-primary\" id=\"dss-m-save\" onclick=\"dssSave()\" style=\"margin-top:10px\"><i class=\"ti ti-check\"></i> Save product</button>\n</div></div>";
  while(m.firstChild) document.body.appendChild(m.firstChild);
})();

// ══════════════════════════════════
// DELIVERY STEP STORE (My store) — the owner's own shop.
// The store = one restaurants row (category 'ds_store'); products = menu_items; secret cost + stock = ds_store_items;
// every sold line is logged in ds_store_sales with the cost at that time (database triggers).
// ══════════════════════════════════
var DSS={store:null,deps:[],items:[],ext:{},mods:{},stats:null,days:7,tab:'ov',pdep:'all',editId:null,img:null,imgUrl:'',logo:null};
var DSS_CAR={stc:['stc','#4f008c'],mobily:['mobily','#0369a1'],zain:['zain','#111']};
function _dssN(v){ var n=Number(v); return isFinite(n)?n:0; }
function _dssF0(n){ return Math.round(_dssN(n)).toLocaleString('en-US'); }
function _dssF2(n){ return (Math.round(_dssN(n)*100)/100).toLocaleString('en-US',{maximumFractionDigits:2}); }
function _dssNorm(s){ return String(s||'').toLowerCase().replace(/[أإآا]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي'); }
function _dssDep(name){ return DSS.deps.find(function(d){ return d.name===name; })||null; }
// recharge companies: one department per company (logo, name on the card, colour), or an older mixed department split by the name
var DSS_RCP=[[/stc|سوا|اس تي سي|اس تي اس/,'stc','stc','#4f008c','#7c3aed'],[/mobi?ly|mobliy|موبايلي|موبيلي|موبابلي/,'mobily','mobily','#0369a1','#38bdf8'],[/zain|زين|زاين/,'zain','zain','#111827','#4b5563'],
  [/lebara|ليبارا/,'lebara','Lebara','#1d4ed8','#ec4899'],[/virgin|فيرجن/,'virgin','Virgin','#b91c1c','#ef4444'],[/salam|سلام/,'salam','SALAM','#047857','#10b981'],[/friendi|فرندي/,'friendi','FRiENDi','#ea580c','#f59e0b']];
var DSS_RCOL={blue:['#1d4ed8','#38bdf8'],orange:['#c2410c','#f59e0b'],gold:['#a16207','#facc15'],black:['#111827','#4b5563'],green:['#047857','#10b981'],purple:['#4f008c','#7c3aed'],red:['#b91c1c','#ef4444']};
function _dssRcLook(d,itName){
  var p=DSS_RCP.find(function(x){ return x[0].test(_dssNorm(d.name+' '+(d.card_title||''))); }), mine=!!(p||d.image_url||d.card_title);
  if(!mine&&itName) p=DSS_RCP.find(function(x){ return x[0].test(_dssNorm(itName)); });
  var c=(mine&&DSS_RCOL[d.card_color])||(p?[p[3],p[4]]:DSS_RCOL.purple);
  return {k:p?p[1]:'d:'+d.id, n:(mine&&d.card_title)||(p?p[2]:d.name), c1:c[0], c2:c[1], mine:mine};
}
function _dssCard(it){ var d=_dssDep(it&&it.category); if(!d||d.kind!=='recharge'||d.gift) return null;
  var m=/(\d+(?:\.\d+)?)/.exec(String(it.name).replace(/[٠-٩]/g,function(c){ return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); })); if(!m) return null;
  var L=_dssRcLook(d,it.name); return {k:L.k,v:Number(m[1]),n:L.n,c:L.c1}; }
function _dssThumb(it){ var c=_dssCard(it);
  if(it&&it.image_url) return '<span class="dss-th"><img src="'+escHtml(it.image_url)+'" alt="" loading="lazy" onerror="this.remove()"></span>';
  if(c) return '<span class="dss-th cd" style="background:'+c.c+'">'+c.v+'</span>';
  var d=_dssDep(it&&it.category);
  if(d&&d.gift){ var gm=/(\d+(?:\.\d+)?)/.exec(String(it.name).replace(/[٠-٩]/g,function(x){ return '٠١٢٣٤٥٦٧٨٩'.indexOf(x); })); return '<span class="dss-th cd" style="background:'+_dssGLook(d).bg+'">'+(gm?gm[1]:escHtml(_dssGLook(d).e))+'</span>'; } return '<span class="dss-th">'+escHtml((d&&d.icon)||'🛍️')+'</span>'; }
function _dssName(it){ return '<div class="dss-nmw">'+_dssThumb(it)+'<span class="dss-ar">'+escHtml(it.name)+'</span></div>'; }
function _dssSell(it){ var p=_dssN(it.price), d=it.discount_price!=null?_dssN(it.discount_price):0; return (d>0&&d<p)?d:p; }
function _dssStat(id){ var s=DSS.stats||{}; return (s.items||[]).find(function(x){ return x.item_id===id; })||{qty:0,sales:0,profit:0}; }
function _dssSpeed(id){ var s=DSS.stats||{}; return _dssN((s.speed||{})[id]); }   // pieces sold in the last 30 days

async function loadDsStore(){
  var setup=document.getElementById('dss-setup'), body=document.getElementById('dss-body');
  try{
    var r=await sb.from('restaurants').select('*').eq('category','ds_store').order('created_at').limit(1);
    if(r.error) throw r.error;
    DSS.store=(r.data&&r.data[0])||null;
    if(!DSS.store){ body.style.display='none'; setup.style.display=''; document.getElementById('dss-add').style.display='none'; document.getElementById('dss-open').style.display='none'; dssRenderSetup(); dssHeader(); return; }
    setup.style.display='none'; body.style.display=''; document.getElementById('dss-add').style.display=''; document.getElementById('dss-open').style.display='';
    var res=await Promise.all([
      sb.from('ds_store_departments').select('*').order('sort_order'),
      sb.from('menu_items').select('*').eq('restaurant_id',DSS.store.id).order('sort_order').limit(2000),
      sb.from('ds_store_items').select('*').limit(5000),
      sb.rpc('admin_ds_store_stats',{p_days:DSS.days}),
      sb.from('settings').select('value').eq('key','ds_store_digital').limit(1)
    ]);
    DSS.dig={on:false,fee:1,stcpay:''}; try{ var dv=res[4]&&res[4].data&&res[4].data[0]&&res[4].data[0].value; if(typeof dv==='string') dv=JSON.parse(dv); if(dv) DSS.dig={on:!!dv.on,fee:(Number(dv.fee)>=0?Number(dv.fee):1),stcpay:String(dv.stcpay||'')}; }catch(e){}
    DSS.deps=res[0].data||[]; DSS.items=res[1].data||[];
    DSS.ext={}; (res[2].data||[]).forEach(function(x){ DSS.ext[x.item_id]=x; });
    DSS.stats=res[3].error?null:res[3].data;
    DSS.mods={};
    if(DSS.items.length){
      var g=await sb.from('modifier_groups').select('id,menu_item_id,name').in('menu_item_id',DSS.items.map(function(i){ return i.id; }));
      var gs=g.data||[];
      if(gs.length){ var o=await sb.from('modifier_options').select('id,group_id,name,extra_price,sort_order').in('group_id',gs.map(function(x){ return x.id; })).order('sort_order');
        gs.forEach(function(gr){ DSS.mods[gr.menu_item_id]={gid:gr.id,name:gr.name,opts:(o.data||[]).filter(function(x){ return x.group_id===gr.id; })}; }); }
    }
    dssHeader(); dssRenderAll();
  }catch(e){ body.style.display='none'; setup.style.display=''; setup.innerHTML='<div class="dss-setup"><b>Could not load the store.</b><div class="dss-msg" style="color:#b91c1c">'+escHtml(e&&e.message||e)+'</div><button class="dss-btn" onclick="loadDsStore()">Try again</button></div>'; }
}
function dssHeader(){
  var s=DSS.store, st=document.getElementById('dss-state'), lg=document.getElementById('dss-logo');
  if(!s){ st.className='dss-state hid'; st.textContent='Not set up'; return; }
  document.getElementById('dss-title-ar').textContent=s.name||'';
  if(s.is_active===false){ st.className='dss-state hid'; st.textContent='Hidden from customers'; }
  else if(s.is_open===false){ st.className='dss-state off'; st.textContent='Closed'; }
  else { st.className='dss-state on'; st.textContent='Live'; }
  lg.innerHTML=s.logo_url?'<img src="'+escHtml(s.logo_url)+'" alt="">':'📱';
  var b=document.getElementById('dss-nav-badge'); if(b) b.style.display='none';
}
function dssRenderSetup(){
  document.getElementById('dss-setup').innerHTML='<div class="dss-setup"><h3>🛍️ Set up your store</h3>'+
    '<div style="font-size:12.5px">One time only. The store starts <b>hidden</b> from customers — add your products, check it with <b>Open store page</b>, then switch it on in <b>Store settings</b>.</div>'+
    '<ol class="dss-steps"><li>Upload the new website files first (dsstore.html, index.html, restaurants.html, menu.html, dssearch.js).</li><li>Press <b>Create my store</b> (4 starting departments are added: شحن رصيد · شواحن وكيابل · سماعات · كفرات وحماية).</li><li>Add products with buying cost and stock.</li><li>Store settings → switch on <b>Show the store to customers</b> and <b>Open for orders now</b>.</li></ol>'+
    '<div class="dss-grid2"><div class="dss-f"><label>Store name</label><input id="dss-new-name" class="dss-ar" value="متجر خطوة التوصيل"></div>'+
    '<div class="dss-f"><label>Delivery fee (SAR)</label><input id="dss-new-fee" type="number" min="0" step="0.5" value="7"></div>'+
    '<div class="dss-f" style="grid-column:1/-1"><label>WhatsApp number for the store</label><input id="dss-new-wa" dir="ltr" placeholder="9665XXXXXXXX"></div></div>'+
    '<button class="btn-primary" style="margin-top:12px" id="dss-new-btn" onclick="dssCreate()"><i class="ti ti-check"></i> Create my store</button><div class="dss-msg" id="dss-new-msg"></div></div>';
}
async function dssCreate(){
  var b=document.getElementById('dss-new-btn'), m=document.getElementById('dss-new-msg'); b.disabled=true; m.style.color='var(--muted)'; m.textContent='Creating…';
  var r=await sb.rpc('ds_store_setup',{p_name:document.getElementById('dss-new-name').value.trim(),p_fee:_dssN(document.getElementById('dss-new-fee').value)||0,p_whatsapp:document.getElementById('dss-new-wa').value.replace(/\D/g,'')});
  if(r.error){ b.disabled=false; m.style.color='#b91c1c'; m.textContent='❌ '+r.error.message; return; }
  showToast('✅ Store created — add your products, then open it'); DSS.tab='pr'; await loadDsStore(); dssTab('pr');
}
function dssTab(t){ DSS.tab=t; document.querySelectorAll('#dss-tabs button').forEach(function(b){ b.classList.toggle('on',b.dataset.p===t); });
  document.querySelectorAll('#section-dsstore .dss-pane').forEach(function(p){ p.classList.toggle('on',p.id==='dss-p-'+t); }); }
function dssPeriod(d){ DSS.days=d; document.querySelectorAll('#dss-seg button').forEach(function(b){ b.classList.toggle('on',Number(b.dataset.d)===d); }); loadDsStore(); }
function dssRenderAll(){ dssRenderOverview(); dssRenderProducts(); dssRenderStock(); dssRenderDeps(); dssRenderOrders(); dssRenderSettings(); }

// ── Overview ──
function dssRenderOverview(){
  var s=DSS.stats||{}, sales=_dssN(s.sales), profit=_dssN(s.profit), orders=_dssN(s.orders), prev=_dssN(s.prev_sales), nc=_dssN(s.sales_no_cost);
  document.getElementById('dss-range').textContent=s.from?(s.days===1?'Today':(s.from+' → '+s.to))+' · compared with the '+(s.days===1?'day':s.days+' days')+' before':'';
  document.getElementById('dss-k-sales').innerHTML=_dssF0(sales)+' <small>SAR</small>';
  var ch=prev>0?Math.round((sales-prev)/prev*100):null;
  document.getElementById('dss-k-sales-s').innerHTML=ch==null?(sales>0?'first sales 🎉':'no sales yet'):'<span class="'+(ch>=0?'dss-up':'dss-down')+'">'+(ch>=0?'▲ ':'▼ ')+Math.abs(ch)+'%</span> vs before';
  document.getElementById('dss-k-profit').innerHTML=_dssF0(profit)+' <small>SAR</small>';
  document.getElementById('dss-k-profit-s').innerHTML=(sales-nc>0?'<span class="dss-up">'+Math.round(profit/(sales-nc)*100)+'%</span> of sales is profit':'')+(nc>0?(sales-nc>0?' · ':'')+'<span style="color:#b45309">'+_dssF0(nc)+' SAR sold without a buying cost</span>':'');
  document.getElementById('dss-k-orders').textContent=orders;
  document.getElementById('dss-k-orders-s').textContent=orders?('avg '+_dssF0(sales/orders)+' SAR per order'):'';
  document.getElementById('dss-k-cust').textContent=_dssN(s.customers);
  document.getElementById('dss-k-cust-s').innerHTML=_dssN(s.new_customers)+' new · <span class="dss-up">'+_dssN(s.came_back)+' came back</span>';
  dssRenderAttention();
  // per day
  var days=s.by_day||[], mx=Math.max.apply(null,days.map(function(d){ return _dssN(d.sales); }).concat([1]));
  var DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  document.getElementById('dss-days').innerHTML=days.length?days.map(function(d){ var v=_dssN(d.sales), p=Math.max(0,_dssN(d.profit)), dt=new Date(d.d+'T12:00:00');
    var lbl=days.length>14?String(dt.getDate()):(DN[dt.getDay()]+' '+dt.getDate());
    return '<div class="dss-bw"><div class="dss-tip">'+DN[dt.getDay()]+' '+dt.getDate()+'/'+(dt.getMonth()+1)+'<br>Sales <b>'+_dssF0(v)+' SAR</b><br>Profit <b>'+_dssF0(p)+' SAR</b><br>Orders <b>'+_dssN(d.orders)+'</b></div>'+
      (days.length<=14&&v>0?'<div class="v">'+_dssF0(v)+'</div>':'')+'<div class="dss-bar" style="height:'+(v/mx*86)+'%"><i style="height:'+(v>0?Math.min(100,p/v*100):0)+'%"></i></div><div class="d">'+lbl+'</div></div>'; }).join(''):'<div class="dss-empty" style="width:100%">No sales in this period yet.</div>';
  // departments
  var bd=s.by_dep||[], ts=Math.max(sales,1), tp=Math.max(profit,1);
  document.getElementById('dss-deps').innerHTML=bd.length?bd.map(function(d){ var dep=_dssDep(d.dep);
    return '<div class="dss-dep"><div class="h"><span style="color:var(--text);font-weight:800" class="dss-ar">'+escHtml(((dep&&dep.icon)||'')+' '+d.dep)+'</span><span>'+_dssF0(d.sales)+' SAR · <b style="color:#15803d">'+_dssF0(d.profit)+' profit</b></span></div>'+
      '<div class="dss-sub">Sales '+Math.round(_dssN(d.sales)/ts*100)+'%</div><div class="dss-track"><i style="width:'+(_dssN(d.sales)/ts*100)+'%;background:#a78bfa"></i></div>'+
      '<div class="dss-sub">Profit '+Math.round(Math.max(0,_dssN(d.profit))/tp*100)+'%</div><div class="dss-track"><i style="width:'+(Math.max(0,_dssN(d.profit))/tp*100)+'%;background:#16a34a"></i></div></div>'; }).join(''):'<div class="dss-empty">Nothing sold yet.</div>';
  var rc=bd.find(function(d){ var x=_dssDep(d.dep); return x&&x.kind==='recharge'; });
  var acc=bd.filter(function(d){ var x=_dssDep(d.dep); return !(x&&x.kind==='recharge'); });
  var accP=acc.reduce(function(a,d){ return a+_dssN(d.profit); },0);
  document.getElementById('dss-insight').innerHTML=(rc&&accP>0&&_dssN(rc.sales)>0)?'<div class="dss-insight">💡 <b>Recharge cards bring customers</b> ('+Math.round(_dssN(rc.sales)/ts*100)+'% of sales) but earn little. <b>Accessories bring the profit</b> ('+Math.round(accP/tp*100)+'% of profit). Add an accessory offer next to the cards (e.g. a “card + cable” product with a discount price).</div>':'';
  // best / profit
  var it=(s.items||[]).filter(function(x){ return x.item_id; });
  var byId=function(id){ return DSS.items.find(function(i){ return i.id===id; })||{name:'?'}; };
  var best=it.slice().sort(function(a,b){ return b.qty-a.qty; }).slice(0,6), mq=best.length?best[0].qty:1;
  document.getElementById('dss-best').innerHTML=best.length?'<tr><th>#</th><th>Product</th><th class="num">Sold</th><th></th></tr>'+best.map(function(x,i){ return '<tr><td><span class="dss-rk">'+(i+1)+'</span></td><td class="nm">'+_dssName(Object.assign({},byId(x.item_id),{name:x.name}))+'</td><td class="num"><b>'+x.qty+'</b></td><td><span class="dss-mini"><i style="width:'+(x.qty/mq*100)+'%"></i></span></td></tr>'; }).join(''):'<tr><td class="dss-empty">No sales yet.</td></tr>';
  var pf=it.filter(function(x){ return _dssN(x.profit)>0; }).sort(function(a,b){ return b.profit-a.profit; }).slice(0,6);
  document.getElementById('dss-prof').innerHTML=pf.length?'<tr><th>#</th><th>Product</th><th class="num">Profit / piece</th><th class="num">Profit</th></tr>'+pf.map(function(x,i){ return '<tr><td><span class="dss-rk">'+(i+1)+'</span></td><td class="nm">'+_dssName(Object.assign({},byId(x.item_id),{name:x.name}))+'</td><td class="num">'+_dssF2(x.profit/Math.max(1,x.qty))+'</td><td class="num"><b style="color:#15803d">'+_dssF0(x.profit)+' SAR</b></td></tr>'; }).join(''):'<tr><td class="dss-empty">Add buying costs in <b>Products &amp; profit</b> to see your profit per item.</td></tr>';
  // hours
  var hs=s.hours||{}, hv=[], hm=1, tot=0; for(var h=0;h<24;h++){ var c=_dssN(hs[h]); hv.push(c); hm=Math.max(hm,c); tot+=c; }
  var bestH=-1,bestS=-1; for(var k=0;k<24;k++){ var w=hv[k]+hv[(k+1)%24]+hv[(k+2)%24]; if(w>bestS){ bestS=w; bestH=k; } }
  document.getElementById('dss-hrs').innerHTML=hv.map(function(v,i){ var inB=tot&&(i===bestH||i===(bestH+1)%24||i===(bestH+2)%24); return '<i class="'+(inB?'pk':'')+'" style="height:'+(v/hm*100)+'%" title="'+i+':00 — '+v+' orders"></i>'; }).join('');
  var hh=function(x){ x=x%24; return (x%12||12)+(x<12?' am':' pm'); };
  document.getElementById('dss-busy').innerHTML=tot?('Busiest: <b>'+hh(bestH)+' – '+hh(bestH+3)+'</b> ('+Math.round(bestS/tot*100)+'% of orders)'):'<span style="color:var(--muted)">Shows after the first orders.</span>';
  // carriers
  var cc={}, cl={}, amt={};
  it.forEach(function(x){ var c=_dssCard(byId(x.item_id)); if(c){ cc[c.k]=(cc[c.k]||0)+_dssN(x.qty); cl[c.k]=c; amt[c.v]=(amt[c.v]||0)+_dssN(x.qty); } });
  var ct=Object.keys(cc).reduce(function(s,k){ return s+cc[k]; },0), topA=Object.keys(amt).sort(function(a,b){ return amt[b]-amt[a]; })[0];
  document.getElementById('dss-car').innerHTML=ct?Object.keys(cc).sort(function(a,b){ return cc[b]-cc[a]; }).map(function(k){ return '<div class="dss-dep"><div class="h"><span class="dss-pill" style="background:'+cl[k].c+';color:#fff">'+escHtml(cl[k].n)+'</span><span>'+cc[k]+' cards · '+Math.round(cc[k]/ct*100)+'%</span></div><div class="dss-track"><i style="width:'+(cc[k]/ct*100)+'%;background:#7c3aed"></i></div></div>'; }).join('')+
    (topA?'<div style="font-size:12px;color:var(--muted)">Most asked amount: <b style="color:var(--text)">'+topA+' SAR</b> — keep the most of it.</div>':''):'<div class="dss-empty">No cards sold in this period.</div>';
}
function dssRenderAttention(){
  var out=[], soldOut=[], low=[], idle=[], noCost=0;
  DSS.items.filter(function(i){ return i.is_active!==false; }).forEach(function(i){
    var e=DSS.ext[i.id]||{}, sp=_dssSpeed(i.id), st=e.stock;
    if(e.cost==null) noCost++;
    if(i.in_stock===false||(st!=null&&st<=0)) soldOut.push({i:i,sp:sp});
    else if(st!=null&&st<=_dssN(e.low_at==null?3:e.low_at)) low.push({i:i,st:st,sp:sp});
    if(st!=null&&st>0&&sp===0&&_dssStoreAgeDays()>=14) idle.push({i:i,st:st,money:st*_dssN(e.cost)});
  });
  soldOut.sort(function(a,b){ return b.sp-a.sp; }); low.sort(function(a,b){ return (a.st/(a.sp||0.01))-(b.st/(b.sp||0.01)); }); idle.sort(function(a,b){ return b.money-a.money; });
  if(soldOut.length) out.push('<div class="dss-ai"><span class="dss-pill r">⛔ Sold out</span><div class="t">'+soldOut.slice(0,4).map(function(x){ return '<b class="dss-ar">'+escHtml(x.i.name)+'</b>'+(x.sp?' <span class="m">('+x.sp+' sold in 30 days)</span>':''); }).join(' · ')+(soldOut.length>4?' <span class="m">+'+(soldOut.length-4)+' more</span>':'')+' <span class="m">— customers can\'t order these now.</span></div><button class="dss-btn sm" onclick="dssTab(\'st\')">Buying list</button></div>');
  if(low.length) out.push('<div class="dss-ai"><span class="dss-pill a">🔻 Low</span><div class="t">'+low.slice(0,4).map(function(x){ return '<b class="dss-ar">'+escHtml(x.i.name)+'</b> '+x.st+' left'+(x.sp?' <span class="m">(~'+Math.max(1,Math.round(x.st/(x.sp/30)))+' days)</span>':''); }).join(' · ')+(low.length>4?' <span class="m">+'+(low.length-4)+' more</span>':'')+'</div><button class="dss-btn sm" onclick="dssTab(\'st\')">Buying list</button></div>');
  if(idle.length) out.push('<div class="dss-ai"><span class="dss-pill g">💤 Not selling</span><div class="t">'+idle.slice(0,3).map(function(x){ return '<b class="dss-ar">'+escHtml(x.i.name)+'</b> <span class="m">'+x.st+' in stock'+(x.money?' = '+_dssF0(x.money)+' SAR waiting':'')+'</span>'; }).join(' · ')+' <span class="m">— 0 sold in 30 days. Try a discount price or a banner.</span></div><button class="dss-btn sm" onclick="dssTab(\'pr\')">Products</button></div>');
  if(noCost) out.push('<div class="dss-ai"><span class="dss-pill b">✏️ Buying cost missing</span><div class="t">'+noCost+' product'+(noCost>1?'s have':' has')+' no buying cost <span class="m">— profit can\'t be counted for them.</span></div><button class="dss-btn sm" onclick="dssTab(\'pr\')">Add costs</button></div>');
  var el=document.getElementById('dss-att'); el.innerHTML=out.length?'<h3>⚠️ Needs your attention <span class="dss-pill a">'+out.length+'</span></h3>'+out.join(''):'';
  var b=document.getElementById('dss-st-badge'); b.style.display=(soldOut.length+low.length)?'':'none'; b.textContent=soldOut.length+low.length;
}
function _dssStoreAgeDays(){ var c=DSS.store&&DSS.store.created_at; return c?(Date.now()-new Date(c).getTime())/864e5:0; }

// ── Products & profit ──
function dssRenderProducts(){
  var used=DSS.deps.filter(function(d){ return DSS.items.some(function(i){ return i.category===d.name; }); });
  var chips=[['all','All']].concat(used.map(function(d){ return [d.name,(d.icon?d.icon+' ':'')+d.name]; }));
  if(DSS.items.some(function(i){ return !_dssDep(i.category); })) chips.push(['__other','Other']);
  document.getElementById('dss-pr-dep').innerHTML=chips.map(function(c){ return '<button type="button" class="'+(DSS.pdep===c[0]?'on':'')+'" data-d="'+escHtml(c[0])+'" onclick="DSS.pdep=this.dataset.d;dssRenderProducts()"><span class="dss-ar">'+escHtml(c[1])+'</span></button>'; }).join('');
  var q=_dssNorm(document.getElementById('dss-pr-q').value.trim());
  var list=DSS.items.filter(function(i){ return (DSS.pdep==='all'||(DSS.pdep==='__other'?!_dssDep(i.category):i.category===DSS.pdep))&&(!q||_dssNorm(i.name).indexOf(q)>-1); });
  var days=(DSS.stats&&DSS.stats.days)||DSS.days;
  document.getElementById('dss-ptab').innerHTML=list.length?'<tr><th>Product</th><th>Department</th><th class="num">Buying cost</th><th class="num">Price</th><th class="num">Profit / piece</th><th class="num">Margin</th><th class="num">In stock</th><th class="num">Sold ('+(days===1?'today':days+'d')+')</th><th class="num">Profit</th><th></th></tr>'+
    list.map(function(i){ var e=DSS.ext[i.id]||{}, p=_dssSell(i), c=e.cost, u=c!=null?p-_dssN(c):null, m=(u!=null&&p>0)?u/p*100:null, s=_dssStat(i.id);
      var stk=e.stock==null?'':e.stock;
      return '<tr class="'+(i.is_active===false?'hid':'')+'"><td class="nm">'+_dssName(i)+(i.is_active===false?' <span class="dss-pill g">hidden</span>':'')+(i.in_stock===false?' <span class="dss-pill r">sold out</span>':'')+(DSS.mods[i.id]?' <span class="dss-pill b">model</span>':'')+'</td>'+
        '<td class="dss-ar">'+escHtml(i.category||'')+'</td>'+
        '<td class="num"><input class="dss-in'+(c==null?' miss':'')+'" type="number" min="0" step="0.01" value="'+(c==null?'':c)+'" placeholder="add" data-id="'+i.id+'" data-f="cost" onchange="dssInline(this)" aria-label="Buying cost"></td>'+
        '<td class="num"><input class="dss-in" type="number" min="0" step="0.5" value="'+_dssN(i.price)+'" data-id="'+i.id+'" data-f="price" onchange="dssInline(this)" aria-label="Price">'+(p<_dssN(i.price)?'<div style="font-size:10.5px;color:#b45309">offer '+_dssF2(p)+'</div>':'')+'</td>'+
        '<td class="num">'+(u==null?'—':_dssF2(u))+'</td>'+
        '<td class="num">'+(m==null?'—':'<span class="dss-pill '+(m>=40?'ok':m>=10?'a':'g')+'">'+Math.round(m)+'%</span>')+'</td>'+
        '<td class="num"><input class="dss-in'+(e.stock!=null&&e.stock<=0?' miss':'')+'" type="number" step="1" value="'+stk+'" placeholder="—" data-id="'+i.id+'" data-f="stock" onchange="dssInline(this)" aria-label="Stock" style="width:62px"></td>'+
        '<td class="num">'+_dssN(s.qty)+'</td><td class="num"><b style="color:#15803d">'+(s.qty?_dssF0(s.profit):'—')+'</b></td>'+
        '<td><button type="button" class="dss-btn sm" onclick="dssEdit(\''+i.id+'\')">Edit</button></td></tr>'; }).join(''):
    '<tr><td class="dss-empty">'+(DSS.items.length?'Nothing matches.':'No products yet — press <b>＋ Add product</b> (top right).')+'</td></tr>';
}
async function dssInline(el){
  var id=el.dataset.id, f=el.dataset.f, raw=el.value.trim(), v=raw===''?null:Number(raw), r;
  if(raw!==''&&!isFinite(v)) return;
  if(f==='price'){ if(v==null||v<0){ el.value=(DSS.items.find(function(i){ return i.id===id; })||{}).price; return; } r=await sb.from('menu_items').update({price:v}).eq('id',id); if(!r.error) DSS.items.find(function(i){ return i.id===id; }).price=v; }
  else{ if(f==='cost'&&v!=null&&v<0) return; if(f==='stock'&&v!=null) v=Math.round(v);
    var row=Object.assign({item_id:id},DSS.ext[id]?{}:{low_at:3}); row[f]=v; row.updated_at=new Date().toISOString();
    r=await sb.from('ds_store_items').upsert(row,{onConflict:'item_id'}).select().single();
    if(!r.error&&r.data) DSS.ext[id]=r.data;
    if(!r.error&&f==='stock'){ var it=DSS.items.find(function(i){ return i.id===id; }); var fr=await sb.from('menu_items').select('in_stock').eq('id',id).single(); if(it&&fr.data) it.in_stock=fr.data.in_stock; }
  }
  if(r.error){ showToast('❌ '+r.error.message); return; }
  el.classList.add('saved'); setTimeout(function(){ el.classList.remove('saved'); dssRenderProducts(); dssRenderStock(); dssRenderAttention(); },700);
}

// ── Stock & buying ──
function _dssBuyRows(){
  return DSS.items.filter(function(i){ return i.is_active!==false; }).map(function(i){ var e=DSS.ext[i.id]||{}, sp=_dssSpeed(i.id), pd=sp/30, st=e.stock;
    var days=st==null?null:(pd?st/pd:Infinity), need=st==null?0:Math.max(0,Math.ceil(pd*14)-st);
    if(st!=null&&st<=0&&need===0&&sp===0) need=0;
    return {i:i,e:e,sp:sp,st:st,days:days,need:need}; })
    .sort(function(a,b){ var x=a.days==null?1e9:a.days, y=b.days==null?1e9:b.days; return x-y||b.sp-a.sp; });
}
function dssRenderStock(){
  var rows=_dssBuyRows(), n=0, cost=0, missing=0;
  document.getElementById('dss-stab').innerHTML=rows.length?'<tr><th>Product</th><th class="num">In stock</th><th class="num">Sells per week</th><th class="num">Enough for</th><th class="num">Buy now (2 weeks)</th><th class="num">Cost</th><th></th></tr>'+
    rows.map(function(x){ if(x.need){ n+=x.need; if(x.e.cost!=null) cost+=x.need*_dssN(x.e.cost); else missing++; }
      var en=x.st==null?'<span class="dss-pill g">not counted</span>':x.st<=0?'<span class="dss-pill r">sold out</span>':x.days===Infinity?'<span class="dss-pill g">not selling</span>':x.days<7?'<span class="dss-pill a">'+Math.max(1,Math.round(x.days))+' days</span>':'<span class="dss-pill ok">'+Math.round(x.days)+' days</span>';
      return '<tr><td class="nm">'+_dssName(x.i)+'</td><td class="num">'+(x.st==null?'—':'<b>'+x.st+'</b>')+'</td><td class="num">'+(x.sp?_dssF2(x.sp/30*7):'0')+'</td><td class="num">'+en+'</td>'+
        '<td class="num">'+(x.need?'<b>'+x.need+'</b>':'—')+'</td><td class="num">'+(x.need?(x.e.cost!=null?_dssF0(x.need*_dssN(x.e.cost))+' SAR':'<span style="color:#b45309">no cost</span>'):'—')+'</td>'+
        '<td><button type="button" class="dss-btn sm" onclick="dssReceive(\''+x.i.id+'\')">＋ Received</button></td></tr>'; }).join(''):'<tr><td class="dss-empty">No products yet.</td></tr>';
  document.getElementById('dss-buy-t').innerHTML=n?'🛒 To buy now: <b>'+n+'</b> pieces · cost about <b>'+_dssF0(cost)+' SAR</b>'+(missing?' <span style="color:#b45309">(+'+missing+' without cost)</span>':''):'✅ Nothing to buy right now (based on the last 30 days of sales).';
}
async function dssReceive(id){
  var it=DSS.items.find(function(i){ return i.id===id; }); if(!it) return;
  var a=prompt('How many pieces of "'+it.name+'" did you receive?','10'); if(a==null) return;
  var k=Math.round(Number(a)); if(!isFinite(k)||k<=0){ showToast('Type a number above 0'); return; }
  var e=DSS.ext[id]||{}, nv=_dssN(e.stock==null?0:Math.max(0,e.stock))+k;
  var r=await sb.from('ds_store_items').upsert({item_id:id,stock:nv,low_at:e.low_at==null?3:e.low_at,updated_at:new Date().toISOString()},{onConflict:'item_id'}).select().single();
  if(r.error){ showToast('❌ '+r.error.message); return; }
  DSS.ext[id]=r.data; it.in_stock=true; showToast('✅ '+it.name+': '+nv+' in stock'); dssRenderStock(); dssRenderProducts(); dssRenderAttention();
}
function dssCopyBuy(){
  var rows=_dssBuyRows().filter(function(x){ return x.need>0; });
  if(!rows.length){ showToast('Nothing to buy right now'); return; }
  var t='🛒 طلبية متجر خطوة التوصيل\n'+rows.map(function(x){ return '• '+x.i.name+' × '+x.need; }).join('\n');
  try{ navigator.clipboard.writeText(t).then(function(){ showToast('✅ Copied — paste it in WhatsApp'); },function(){ prompt('Copy:',t); }); }catch(e){ prompt('Copy:',t); }
}

// ── Departments ──
function _dssGrp(d){ return d.gift?'gift':d.kind==='recharge'?'rc':'n'; }
function dssRenderDeps(){
  var s=(DSS.stats&&DSS.stats.by_dep)||[];
  var cntOf=function(d){ return DSS.items.filter(function(i){ return i.category===d.name&&i.is_active!==false; }).length; };
  var G={rc:{t:'dss-dtab-rc',none:'No phone company yet — add stc, Mobily, Zain… below.',one:'company',many:'companies',p:'cards'},
         gift:{t:'dss-dtab-gift',none:'No game or store yet — add Free Fire, PUBG, PlayStation… below.',one:'brand',many:'brands',p:'packs'},
         n:{t:'dss-dtab',none:'No department yet.',one:'department',many:'departments',p:'products'}};
  Object.keys(G).forEach(function(g){
    var el=document.getElementById(G[g].t); if(!el) return;
    var list=DSS.deps.filter(function(d){ return _dssGrp(d)===g; }), np=list.reduce(function(a,d){ return a+cntOf(d); },0);
    var ne=document.getElementById('dss-grp-'+g+'-n'); if(ne) ne.textContent=list.length?'· '+list.length+' '+(list.length===1?G[g].one:G[g].many)+' · '+np+' '+(np===1?G[g].p.replace(/s$/,''):G[g].p):'';
    el.innerHTML=list.length?'<tr><th>Order</th><th>Icon</th><th>'+(g==='rc'?'Company':g==='gift'?'Game / store':'Department')+'</th><th>Type</th><th class="num">'+(g==='rc'?'Amounts':g==='gift'?'Packs':'Products')+'</th><th class="num">Sales</th><th>Shown</th></tr>'+
      list.map(function(d,k){ var cnt=cntOf(d), sd=s.find(function(x){ return x.dep===d.name; });
        return '<tr class="'+(d.is_active===false?'hid':'')+'"><td><button type="button" class="dss-btn sm" '+(k===0?'disabled':'')+' data-id="'+d.id+'" onclick="dssMoveDep(this.dataset.id,-1)" aria-label="Up">▲</button> <button type="button" class="dss-btn sm" '+(k===list.length-1?'disabled':'')+' data-id="'+d.id+'" onclick="dssMoveDep(this.dataset.id,1)" aria-label="Down">▼</button></td>'+
          '<td><input class="dss-dep-ic" value="'+escHtml(d.icon||'')+'" maxlength="4" data-id="'+d.id+'" onchange="dssDepField(this,\'icon\')" aria-label="Icon"></td>'+
          '<td><input class="dss-in dss-ar" style="width:170px;text-align:right" value="'+escHtml(d.name)+'" data-id="'+d.id+'" onchange="dssRenameDep(this)" aria-label="Name"></td>'+
          '<td><select class="dss-in" style="width:170px;text-align:left" data-id="'+d.id+'" onchange="dssDepType(this)" title="Move to another box"><option value="recharge"'+(g==='rc'?' selected':'')+'>📶 Recharge company</option><option value="gift"'+(g==='gift'?' selected':'')+'>🎮 Gift card brand</option><option value="normal"'+(g==='n'?' selected':'')+'>🛍️ Normal department</option></select></td>'+
          '<td class="num">'+cnt+(cnt?'':' <span style="color:#b45309;font-size:11px">· hidden until it has products</span>')+'</td><td class="num">'+(sd?_dssF0(sd.sales)+' SAR':'—')+'</td>'+
          '<td><label class="dss-sw" style="padding:4px 8px;display:inline-flex"><input type="checkbox" '+(d.is_active!==false?'checked':'')+' data-id="'+d.id+'" onchange="dssDepField(this,\'is_active\')"><span style="font-size:12px">'+(d.is_active!==false?'Yes':'Hidden')+'</span></label></td></tr>'+
          (g==='gift'?_dssGiftRow(d):g==='rc'?_dssRcRow(d):''); }).join(''):'<tr><td class="dss-empty">'+G[g].none+'</td></tr>';
  });
}
// ── Gift card brands (Free Fire, PUBG …): picture + how the pack cards look ──
var DSS_GCOL={blue:['#2f6fe0','#0b1d5c'],orange:['#fb923c','#9a3412'],gold:['#facc15','#854d0e'],black:['#4b5563','#030712'],green:['#4ade80','#14532d'],purple:['#a78bfa','#4c1d95'],red:['#f87171','#7f1d1d']};
var DSS_GDEF=[[/free ?fire|فري ?فاير/,'FREE FIRE','Diamonds','💎','blue'],[/pubg|ببجي|بوبجي/,'PUBG MOBILE','UC','🪖','gold'],[/playstation|psn|بلاي ?ستيشن|سوني/,'PlayStation','$','🎮','blue'],
  [/apple|itunes|app store|ابل|ايتونز/,'App Store','SAR','🍎','black'],[/google|قوقل|جوجل/,'Google Play','SAR','▶️','green'],[/roblox|روبلوكس/,'ROBLOX','$','🧱','black'],[/xbox|اكس ?بوكس/,'XBOX','$','🎮','green'],[/steam|ستيم/,'STEAM','$','🕹️','black']];
function _dssGLook(d){ var n=_dssNorm(d.name+' '+(d.card_title||'')), g=DSS_GDEF.find(function(x){ return x[0].test(n); })||[0,d.name,'','🎁','purple'];
  var c=DSS_GCOL[d.card_color]||DSS_GCOL[g[4]]||DSS_GCOL.purple;
  return {t:String(d.card_title||g[1]).trim(), u:String(d.card_unit==null||d.card_unit===''?g[2]:d.card_unit).trim(), e:d.icon||g[3], bg:'radial-gradient(120% 90% at 50% 38%,'+c[0]+' 0%,'+c[1]+' 90%)', auto:g}; }
function _dssGiftRow(d){
  var L=_dssGLook(d), first=DSS.items.filter(function(i){ return i.category===d.name&&i.is_active!==false; })[0];
  var m=first&&/(\d+(?:\.\d+)?)/.exec(String(first.name).replace(/[٠-٩]/g,function(c){ return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); })), v=m?m[1]:'530';
  var bar=L.u==='$'?'$'+v:(L.u?L.u+' ':'')+v;
  var cols=['','blue','orange','gold','black','green','purple','red'];
  return '<tr class="dss-gift-row"><td colspan="7"><div class="dss-gift">'+
    '<div class="dss-gpic" style="background:'+L.bg+'">'+(d.image_url?'<img src="'+escHtml(d.image_url)+'" alt="">':escHtml(L.e))+'</div>'+
    '<div style="display:flex;flex-direction:column;gap:4px"><label class="dss-btn sm" style="cursor:pointer;flex-direction:row"><i class="ti ti-photo"></i> '+(d.image_url?'Change logo':'Upload brand logo')+'<input type="file" accept="image/*" hidden data-id="'+d.id+'" onchange="dssDepPic(this)"></label>'+
      (d.image_url?'<button type="button" class="dss-btn sm" data-id="'+d.id+'" onclick="dssDepPicDel(this)">Remove logo</button>':'')+'</div>'+
    '<label>Card title<input class="dss-in" style="width:120px;text-align:left" maxlength="16" value="'+escHtml(d.card_title||'')+'" placeholder="'+escHtml(L.auto[1])+'" data-id="'+d.id+'" onchange="dssDepGift(this,\'card_title\')"></label>'+
    '<label>Word on the bar<input class="dss-in" style="width:90px;text-align:left" maxlength="10" value="'+escHtml(d.card_unit||'')+'" placeholder="'+escHtml(L.auto[2]||'—')+'" data-id="'+d.id+'" onchange="dssDepGift(this,\'card_unit\')"></label>'+
    '<label>Colour<select class="dss-in" style="width:90px;text-align:left" data-id="'+d.id+'" onchange="dssDepGift(this,\'card_color\')">'+cols.map(function(c){ return '<option value="'+c+'"'+((d.card_color||'')===c?' selected':'')+'>'+(c||'Auto')+'</option>'; }).join('')+'</select></label>'+
    '<div style="display:flex;flex-direction:column;gap:4px"><label class="dss-btn sm" style="cursor:pointer;flex-direction:row"><i class="ti ti-id"></i> '+(d.card_image?'Change card picture':'Card picture (optional)')+'<input type="file" accept="image/*" hidden data-id="'+d.id+'" onchange="dssDepCard(this)"></label>'+
      (d.card_image?'<button type="button" class="dss-btn sm" data-id="'+d.id+'" onclick="dssDepCardDel(this)">Use drawn card</button>':'')+'</div>'+
    (d.card_image?'<div class="dss-gphoto" style="background-image:url(\''+escHtml(d.card_image)+'\')" title="How each pack looks"><div class="b"><i>'+escHtml(L.e)+'</i><span>'+escHtml(bar)+'</span></div></div>':
    '<div class="dss-gprev" style="background:'+L.bg+'" title="How each pack looks"><span class="t"'+(L.t.length>9?' style="font-size:'+(L.t.length>12?6:7)+'cqw"':'')+'>'+escHtml(L.t)+'</span><span class="e">'+escHtml(L.e)+'</span><span class="b">'+escHtml(bar)+'</span></div>')+
    _dssPacks(d,'gift')+
    '</div></td></tr>';
}
// a recharge company (stc, Mobily, Lebara …): logo tile + how its amount cards look
function _dssRcRow(d){
  var first=DSS.items.filter(function(i){ return i.category===d.name&&i.is_active!==false; })[0], L=_dssRcLook(d,first?first.name:'');
  var m=first&&/(\d+(?:\.\d+)?)/.exec(String(first.name).replace(/[٠-٩]/g,function(c){ return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); })), v=m?m[1]:'20';
  var cols=['','blue','orange','gold','black','green','purple','red'], bg='linear-gradient(135deg,'+L.c1+','+L.c2+')';
  var auto=DSS_RCP.find(function(x){ return x[0].test(_dssNorm(d.name)); });
  return '<tr class="dss-gift-row"><td colspan="7"><div class="dss-gift">'+
    '<div class="dss-gpic" style="background:'+bg+';font:900 15px/1 system-ui,sans-serif">'+(d.image_url?'<img src="'+escHtml(d.image_url)+'" alt="">':escHtml(L.n))+'</div>'+
    '<div style="display:flex;flex-direction:column;gap:4px"><label class="dss-btn sm" style="cursor:pointer;flex-direction:row"><i class="ti ti-photo"></i> '+(d.image_url?'Change logo':'Upload company logo')+'<input type="file" accept="image/*" hidden data-id="'+d.id+'" onchange="dssDepPic(this)"></label>'+
      (d.image_url?'<button type="button" class="dss-btn sm" data-id="'+d.id+'" onclick="dssDepPicDel(this)">Remove logo</button>':'')+'</div>'+
    '<label>Name on the card<input class="dss-in" style="width:120px;text-align:left" maxlength="14" value="'+escHtml(d.card_title||'')+'" placeholder="'+escHtml(L.n)+'" data-id="'+d.id+'" onchange="dssDepGift(this,\'card_title\')"></label>'+
    '<label>Colour<select class="dss-in" style="width:90px;text-align:left" data-id="'+d.id+'" onchange="dssDepGift(this,\'card_color\')">'+cols.map(function(c){ return '<option value="'+c+'"'+((d.card_color||'')===c?' selected':'')+'>'+(c||'Auto')+'</option>'; }).join('')+'</select></label>'+
    '<div style="display:flex;flex-direction:column;gap:4px"><label class="dss-btn sm" style="cursor:pointer;flex-direction:row"><i class="ti ti-id"></i> '+(d.card_image?'Change card picture':'Card picture (optional)')+'<input type="file" accept="image/*" hidden data-id="'+d.id+'" onchange="dssDepCard(this)"></label>'+
      (d.card_image?'<button type="button" class="dss-btn sm" data-id="'+d.id+'" onclick="dssDepCardDel(this)">Use drawn card</button>':'')+'</div>'+
    (d.card_image?'<div class="dss-gphoto" style="background-image:url(\''+escHtml(d.card_image)+'\')" title="How each amount looks"><div class="b"><i>📶</i><span>'+escHtml(v)+' SAR</span></div></div>':
    '<div class="dss-rprev" style="background:'+bg+'" title="How each amount looks"><span class="co"'+(L.n.length>7?' style="font-size:8cqw"':'')+'>'+escHtml(L.n)+'</span><span class="sim"></span><span class="tp">بطاقة شحن</span><span class="ra">'+escHtml(v)+'<small>SAR</small></span></div>')+
    _dssPacks(d,'rc')+
    '</div></td></tr>';
}
// the packs / amounts of a brand or company, right in its row: tap one to edit, «+ Add» opens the form with this department chosen
function _dssPacks(d,g){
  var its=DSS.items.filter(function(i){ return i.category===d.name&&i.is_active!==false; }).sort(function(a,b){ var na=Number((String(a.name).match(/\d+(?:\.\d+)?/)||[0])[0]), nb=Number((String(b.name).match(/\d+(?:\.\d+)?/)||[0])[0]); return na-nb; });
  return '<div class="dss-packs"><span class="lb">'+(g==='rc'?'Amounts:':'Packs:')+'</span>'+
    its.map(function(i){ return '<button type="button" class="dss-pk'+(i.in_stock===false?' out':'')+'" data-id="'+i.id+'" onclick="dssEdit(this.dataset.id)" title="Edit"><span class="dss-ar">'+escHtml(i.name)+'</span><small>'+_dssF2(_dssSell(i))+' SAR</small></button>'; }).join('')+
    '<button type="button" class="dss-pk add" data-d="'+escHtml(d.name)+'" onclick="dssAddTo(this.dataset.d)">＋ '+(g==='rc'?'Add amount':'Add pack')+'</button>'+
    (its.length?'':'<span style="font-size:11.5px;color:#b45309">'+(g==='rc'?'Add its amounts, e.g. <span dir="rtl">شحن 20</span> — then customers see this company':'Add its packs, e.g. <span dir="rtl">530 جوهرة</span> or 20$ — then customers see this brand')+'</span>')+'</div>';
}
function dssAddTo(name){ var keep=DSS.pdep; DSS.pdep=name; try{ dssEdit(null); } finally { DSS.pdep=keep; }
  var n=document.getElementById('dss-m-name'); if(n){ var d=_dssDep(name), g=d?_dssGrp(d):'n'; n.placeholder=g==='rc'?'شحن 20':g==='gift'?'530 جوهرة':''; setTimeout(function(){ try{ n.focus(); }catch(e){} },150); } }
async function dssDepType(el){ var v=el.value, o=v==='gift'?{kind:'normal',gift:true}:{kind:v,gift:false};
  var r=await sb.from('ds_store_departments').update(o).eq('id',el.dataset.id);
  if(r.error){ showToast('❌ '+r.error.message); dssRenderDeps(); return; }
  var d=DSS.deps.find(function(x){ return x.id===el.dataset.id; }); if(d){ d.kind=o.kind; d.gift=o.gift; }
  showToast(v==='gift'?'✅ Gift card brand — add a picture below':v==='recharge'?'✅ Recharge company — add its logo below':'✅ Saved'); dssRenderDeps(); dssRenderProducts(); }
async function dssDepGift(el,f){ var v=el.value.trim()||null, o={}; o[f]=v;
  var r=await sb.from('ds_store_departments').update(o).eq('id',el.dataset.id);
  if(r.error){ showToast('❌ '+r.error.message); return; }
  var d=DSS.deps.find(function(x){ return x.id===el.dataset.id; }); if(d) d[f]=v; showToast('✅ Saved'); dssRenderDeps(); }
async function dssDepPic(inp){ var f=inp.files&&inp.files[0]; if(!f) return; showToast('⏳ Uploading…');
  var url=await uploadImg(f,'categories'); if(!url){ showToast('❌ Upload failed — try again'); return; }
  var r=await sb.from('ds_store_departments').update({image_url:url}).eq('id',inp.dataset.id);
  if(r.error){ showToast('❌ '+r.error.message); return; }
  var d=DSS.deps.find(function(x){ return x.id===inp.dataset.id; }); if(d) d.image_url=url; showToast('✅ Picture saved'); dssRenderDeps(); }
// card picture: cut away the black / see-through border around the card, then upload
async function _dssCropCard(file){
  try{
    var url=URL.createObjectURL(file), im=new Image(); im.src=url; await im.decode(); URL.revokeObjectURL(url);
    var W=im.naturalWidth, H=im.naturalHeight, c=document.createElement('canvas'); c.width=W; c.height=H; var x=c.getContext('2d'); x.drawImage(im,0,0);
    var d=x.getImageData(0,0,W,H).data, x0=W, x1=0, y0=H, y1=0, st=Math.max(1,Math.floor(Math.min(W,H)/400));
    for(var j=0;j<H;j+=st) for(var i=0;i<W;i+=st){ var k=(j*W+i)*4; if(d[k+3]>40&&d[k]+d[k+1]+d[k+2]>60){ if(i<x0)x0=i; if(i>x1)x1=i; if(j<y0)y0=j; if(j>y1)y1=j; } }
    var cw=x1-x0+1, ch=y1-y0+1; if(cw<W*0.5||ch<H*0.5||(cw>W*0.98&&ch>H*0.98)) return file;   // nothing to cut (or not sure) → keep as it is
    var o=document.createElement('canvas'); o.width=cw; o.height=ch; o.getContext('2d').drawImage(c,x0,y0,cw,ch,0,0,cw,ch);
    var b=await new Promise(function(r){ o.toBlob(r,'image/png'); }); return b?new File([b],'card.png',{type:'image/png'}):file;
  }catch(e){ return file; }
}
async function dssDepCard(inp){ var f=inp.files&&inp.files[0]; if(!f) return; showToast('⏳ Uploading…');
  var url=await uploadImg(await _dssCropCard(f),'menu'); if(!url){ showToast('❌ Upload failed — try again'); return; }
  var r=await sb.from('ds_store_departments').update({card_image:url}).eq('id',inp.dataset.id);
  if(r.error){ showToast('❌ '+r.error.message); return; }
  var d=DSS.deps.find(function(x){ return x.id===inp.dataset.id; }); if(d) d.card_image=url; showToast('✅ Card picture saved'); dssRenderDeps(); }
async function dssDepCardDel(el){ var r=await sb.from('ds_store_departments').update({card_image:null}).eq('id',el.dataset.id);
  if(r.error){ showToast('❌ '+r.error.message); return; }
  var d=DSS.deps.find(function(x){ return x.id===el.dataset.id; }); if(d) d.card_image=null; showToast('✅ Back to the drawn card'); dssRenderDeps(); }
async function dssDepPicDel(el){ var r=await sb.from('ds_store_departments').update({image_url:null}).eq('id',el.dataset.id);
  if(r.error){ showToast('❌ '+r.error.message); return; }
  var d=DSS.deps.find(function(x){ return x.id===el.dataset.id; }); if(d) d.image_url=null; showToast('✅ Picture removed'); dssRenderDeps(); }
async function dssDepField(el,f){ var v=f==='is_active'?el.checked:el.value.trim(); if(f==='icon'&&!v) return;
  var o={}; o[f]=v; var r=await sb.from('ds_store_departments').update(o).eq('id',el.dataset.id);
  if(r.error){ showToast('❌ '+r.error.message); return; }
  var d=DSS.deps.find(function(x){ return x.id===el.dataset.id; }); if(d) d[f]=v; showToast('✅ Saved'); dssRenderDeps(); dssRenderProducts(); }
async function dssRenameDep(el){ var v=el.value.trim(); if(!v){ dssRenderDeps(); return; }
  var r=await sb.rpc('ds_store_rename_department',{p_id:el.dataset.id,p_name:v});
  if(r.error){ showToast('❌ '+(/duplicate|unique/i.test(r.error.message)?'A department with this name already exists':r.error.message)); dssRenderDeps(); return; }
  showToast('✅ Renamed — its products moved with it'); loadDsStore(); }
async function dssMoveDep(id,dir){
  var a=DSS.deps.find(function(d){ return d.id===id; }); if(!a) return;
  var same=DSS.deps.filter(function(d){ return _dssGrp(d)===_dssGrp(a); }), b=same[same.indexOf(a)+dir]; if(!b) return;   // up / down inside the same box
  var list=DSS.deps.slice(), ia=list.indexOf(a), ib=list.indexOf(b); list[ia]=b; list[ib]=a;
  var ups=list.map(function(d,i){ return sb.from('ds_store_departments').update({sort_order:i+1}).eq('id',d.id); });
  var rs=await Promise.all(ups); if(rs.some(function(r){ return r.error; })){ showToast('❌ Could not reorder'); return; }
  list.forEach(function(d,i){ d.sort_order=i+1; }); DSS.deps=list; dssRenderDeps(); }
async function dssAddDep(g){ g=g||'n';
  var sfx=g==='n'?'':'-'+g, ni=document.getElementById('dss-nd-name'+sfx), n=ni.value.trim(), ic=document.getElementById('dss-nd-ic'+sfx).value.trim()||(g==='rc'?'📶':g==='gift'?'🎮':'🛍️');
  if(!n){ showToast(g==='rc'?'Write the company name':g==='gift'?'Write the game or store name':'Write the department name'); return; }
  var row={name:n,icon:ic,color:g==='gift'?'#eff6ff':'#f5f3ff',kind:g==='rc'?'recharge':'normal',gift:g==='gift',sort_order:DSS.deps.length+1};
  var r=await sb.from('ds_store_departments').insert(row).select().single();
  if(r.error){ showToast('❌ '+(/duplicate|unique/i.test(r.error.message)?'This name already exists':r.error.message)); return; }
  DSS.deps.push(r.data); ni.value='';
  showToast(g==='rc'?'✅ Company added — upload its logo, then add its amounts in Products':g==='gift'?'✅ Brand added — upload its picture, then add its packs in Products':'✅ Department added'); dssRenderDeps(); }

// ── Orders ──
function dssRenderOrders(){
  var L=(DSS.stats&&DSS.stats.orders_list)||[], SL={pending:'⏳ Pending',new:'⏳ New',assigned:'🛵 Assigned',on_the_way:'🛵 On the way',picked:'🛵 Picked up',delivered:'✅ Delivered',on_hold:'⚠️ Check first'};
  document.getElementById('dss-otab').innerHTML=L.length?'<tr><th>Order</th><th>Time</th><th>Customer</th><th>Store items</th><th class="num">Total</th><th class="num">Profit</th><th>Status</th></tr>'+
    L.map(function(o){ return '<tr><td><b>#'+escHtml(o.num||'')+'</b></td><td>'+_dssAgo(o.at)+'</td><td class="dss-ar">'+escHtml(o.customer||'')+'</td><td class="nm">'+(o.lines||[]).map(function(l){ return '<div class="dss-ar">'+l.qty+'× '+escHtml(l.name)+'</div>'; }).join('')+'</td>'+
      '<td class="num">'+_dssF2(o.total)+'</td><td class="num">'+(o.profit==null?'<span style="color:#b45309">no cost</span>':'<b style="color:#15803d">'+_dssF2(o.profit)+'</b>')+'</td><td>'+(SL[o.status]||escHtml(o.status||''))+'</td></tr>'; }).join(''):'<tr><td class="dss-empty">No store orders in this period.</td></tr>';
}
function _dssAgo(t){ var m=Math.round((Date.now()-new Date(t).getTime())/60000); if(m<60) return m+' min ago'; if(m<1440) return Math.round(m/60)+' h ago'; var d=new Date(t); return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+' '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); }

// ── Store settings ──
function dssRenderSettings(){ var s=DSS.store; if(!s) return;
  document.getElementById('dss-s-active').checked=s.is_active!==false; document.getElementById('dss-s-open').checked=s.is_open!==false;
  document.getElementById('dss-s-name').value=s.name||''; document.getElementById('dss-s-wa').value=s.whatsapp||''; document.getElementById('dss-s-fee').value=s.delivery_fee==null?'':s.delivery_fee;
  document.getElementById('dss-s-time').value=s.delivery_time||''; document.getElementById('dss-s-ot').value=(s.open_time||'').slice(0,5); document.getElementById('dss-s-ct').value=(s.close_time||'').slice(0,5);
  document.getElementById('dss-s-24').checked=!!s.is_24h; DSS.logo=null; DSS.card=null; DSS.cardReset=false;
  var dg=DSS.dig||{on:false,fee:1,stcpay:''}; document.getElementById('dss-d-on').checked=!!dg.on; document.getElementById('dss-d-fee').value=dg.fee; document.getElementById('dss-d-stc').value=dg.stcpay||'';
  document.getElementById('dss-s-card').innerHTML='<img src="'+escHtml(s.banner_url||'/ds-lib/ds-store-card-1.svg')+'" alt="" style="object-fit:cover">';
  document.getElementById('dss-s-logo').innerHTML=s.logo_url?'<img src="'+escHtml(s.logo_url)+'" alt="">':'Upload logo'; }
function dssPickCard(inp){ var f=inp.files&&inp.files[0]; if(!f) return; DSS.card=f; DSS.cardReset=false; var r=new FileReader(); r.onload=function(e){ document.getElementById('dss-s-card').innerHTML='<img src="'+e.target.result+'" alt="" style="object-fit:cover">'; }; r.readAsDataURL(f); inp.value=''; }
function dssCardDefault(){ DSS.card=null; DSS.cardReset=true; document.getElementById('dss-s-card').innerHTML='<img src="/ds-lib/ds-store-card-1.svg" alt="" style="object-fit:cover">'; }
function dssPickLogo(inp){ var f=inp.files&&inp.files[0]; if(!f) return; DSS.logo=f; var r=new FileReader(); r.onload=function(e){ document.getElementById('dss-s-logo').innerHTML='<img src="'+e.target.result+'" alt="">'; }; r.readAsDataURL(f); }
async function dssSaveSettings(){
  var b=document.getElementById('dss-s-save'), m=document.getElementById('dss-s-msg'), name=document.getElementById('dss-s-name').value.trim();
  if(!name){ m.style.color='#b91c1c'; m.textContent='Write the store name.'; return; }
  b.disabled=true; m.style.color='var(--muted)'; m.textContent='Saving…';
  var o={is_active:document.getElementById('dss-s-active').checked,is_open:document.getElementById('dss-s-open').checked,name:name,whatsapp:document.getElementById('dss-s-wa').value.replace(/\D/g,''),
    delivery_fee:Math.max(0,_dssN(document.getElementById('dss-s-fee').value)),delivery_time:document.getElementById('dss-s-time').value.trim()||'20-30',
    open_time:document.getElementById('dss-s-ot').value||'08:00',close_time:document.getElementById('dss-s-ct').value||'02:00',is_24h:document.getElementById('dss-s-24').checked};
  if(DSS.logo){ var u=await uploadImg(DSS.logo,'logos'); if(u) o.logo_url=u; }
  if(DSS.card){ var cu=await uploadImg(DSS.card,'logos'); if(!cu){ b.disabled=false; m.style.color='#b91c1c'; m.textContent='❌ Picture upload failed — try again.'; return; } o.banner_url=cu; }
  else if(DSS.cardReset) o.banner_url=null;
  var oldName=DSS.store.name;
  var dg={on:document.getElementById('dss-d-on').checked,fee:Math.max(0,_dssN(document.getElementById('dss-d-fee').value)),stcpay:document.getElementById('dss-d-stc').value.replace(/[^\d+]/g,'')};
  var rd=await sb.from('settings').upsert([{key:'ds_store_digital',value:JSON.stringify(dg)}],{onConflict:'key'});
  if(rd.error){ b.disabled=false; m.style.color='#b91c1c'; m.textContent='❌ '+rd.error.message; return; }
  DSS.dig=dg;
  var r=await sb.from('restaurants').update(o).eq('id',DSS.store.id);
  b.disabled=false;
  if(r.error){ m.style.color='#b91c1c'; m.textContent='❌ '+r.error.message; return; }
  Object.assign(DSS.store,o); DSS.card=null; DSS.cardReset=false; DSS.logo=null; m.style.color='#15803d';
  m.textContent='✅ Saved'+(oldName!==name?' — note: orders already in customers\' carts keep the old name':'');
  dssHeader(); showToast('✅ Store settings saved');
}

// ── Add / edit product ──
function dssDepHint(){ var el=document.getElementById('dss-m-dephint'), sel=document.getElementById('dss-m-dep'); if(!el||!sel) return;
  var d=_dssDep(sel.value), g=d?_dssGrp(d):'n';
  el.innerHTML=g==='rc'?'📶 Recharge card — name = the amount, e.g. <span dir="rtl">شحن 20</span> (price 20). Customers choose delivery or a photo on WhatsApp.':
    g==='gift'?'🎮 Gift card — name = the pack with its number, e.g. <span dir="rtl">530 جوهرة</span>. The code is sent on WhatsApp (bank transfer first).':''; }
function dssEdit(id){
  if(!DSS.store){ showToast('Set up the store first'); return; }
  var it=id?DSS.items.find(function(i){ return i.id===id; }):null, e=(it&&DSS.ext[it.id])||{}, md=it&&DSS.mods[it.id];
  DSS.editId=id; DSS.img=null; DSS.imgUrl=(it&&it.image_url)||'';
  document.getElementById('dss-m-title').textContent=it?'Edit product':'Add product';
  var depSel=document.getElementById('dss-m-dep'); var depNow=it?it.category:(DSS.pdep!=='all'&&DSS.pdep!=='__other'?DSS.pdep:(DSS.deps[0]&&DSS.deps[0].name)||'');
  var opts=DSS.deps.map(function(d){ return d.name; }); if(depNow&&opts.indexOf(depNow)<0) opts.push(depNow);
  var _o=function(n){ var d=_dssDep(n); return '<option value="'+escHtml(n)+'"'+(n===depNow?' selected':'')+'>'+escHtml(((d&&d.icon)||'')+' '+n)+'</option>'; };
  var _gl=[['rc','📶 Recharge cards'],['gift','🎮 Gift cards & games'],['n','🛍️ Other departments']];
  depSel.innerHTML=_gl.map(function(g){ var l=opts.filter(function(n){ var d=_dssDep(n); return d?_dssGrp(d)===g[0]:g[0]==='n'; }); return l.length?'<optgroup label="'+g[1]+'">'+l.map(_o).join('')+'</optgroup>':''; }).join('');
  dssDepHint();
  document.getElementById('dss-m-name').value=it?it.name:''; document.getElementById('dss-m-price').value=it?it.price:'';
  document.getElementById('dss-m-disc').value=it&&it.discount_price!=null?it.discount_price:''; document.getElementById('dss-m-cost').value=e.cost==null?'':e.cost;
  document.getElementById('dss-m-stock').value=e.stock==null?'':e.stock; document.getElementById('dss-m-low').value=e.low_at==null?3:e.low_at;
  document.getElementById('dss-m-desc').value=(it&&it.description)||''; document.getElementById('dss-m-instock').checked=!it||it.in_stock!==false; document.getElementById('dss-m-active').checked=!it||it.is_active!==false;
  document.getElementById('dss-m-mod').checked=!!md; document.getElementById('dss-m-mod-box').style.display=md?'':'none';
  document.getElementById('dss-m-mods').value=md?md.opts.map(function(o){ return o.name+(_dssN(o.extra_price)>0?' + '+_dssN(o.extra_price):''); }).join('\n'):'';
  document.getElementById('dss-m-img').innerHTML=DSS.imgUrl?'<img src="'+escHtml(DSS.imgUrl)+'" alt="">':'Upload photo (square looks best)';
  document.getElementById('dss-m-err').style.display='none'; dssProfitHint(); showModal('modal-dss');
}
function dssPickImg(inp){ var f=inp.files&&inp.files[0]; if(!f) return; DSS.img=f; var r=new FileReader(); r.onload=function(e){ document.getElementById('dss-m-img').innerHTML='<img src="'+e.target.result+'" alt="">'; }; r.readAsDataURL(f); inp.value=''; }
function dssProfitHint(){ var p=_dssN(document.getElementById('dss-m-price').value), d=_dssN(document.getElementById('dss-m-disc').value), c=document.getElementById('dss-m-cost').value.trim();
  var sell=(d>0&&d<p)?d:p, h=document.getElementById('dss-m-profit');
  if(c===''||!p){ h.textContent='Never shown to customers.'; h.style.color=''; return; }
  var u=sell-_dssN(c); h.textContent='Profit per piece: '+_dssF2(u)+' SAR ('+(sell?Math.round(u/sell*100):0)+'%)'; h.style.color=u>0?'#15803d':'#b91c1c'; }
function _dssParseMods(t){ return String(t||'').split('\n').map(function(l){ l=l.trim(); if(!l) return null; var m=/^(.*?)\s*\+\s*(\d+(?:\.\d+)?)\s*$/.exec(l); return m?{name:m[1].trim(),extra:Number(m[2])}:{name:l,extra:0}; }).filter(function(x){ return x&&x.name; }).slice(0,40); }
async function dssSave(){
  var err=document.getElementById('dss-m-err'), btn=document.getElementById('dss-m-save');
  var fail=function(t){ err.style.display='block'; err.textContent=t; btn.disabled=false; btn.innerHTML='<i class="ti ti-check"></i> Save product'; };
  var name=document.getElementById('dss-m-name').value.trim(), dep=document.getElementById('dss-m-dep').value, price=document.getElementById('dss-m-price').value.trim();
  var disc=document.getElementById('dss-m-disc').value.trim(), cost=document.getElementById('dss-m-cost').value.trim(), stock=document.getElementById('dss-m-stock').value.trim(), low=document.getElementById('dss-m-low').value.trim();
  if(!name) return fail('Write the product name.');
  if(!dep) return fail('Choose a department (add one in the Departments tab).');
  if(price===''||!(Number(price)>=0)) return fail('Write the selling price.');
  if(disc!==''&&!(Number(disc)>=0&&Number(disc)<Number(price))) return fail('Discount price must be lower than the price.');
  if(cost!==''&&!(Number(cost)>=0)) return fail('Buying cost must be a number.');
  var dupe=DSS.items.find(function(i){ return i.name===name&&i.id!==DSS.editId; }); if(dupe) return fail('Another product already has this exact name — use a different name (the reports match products by name).');
  var wantMod=document.getElementById('dss-m-mod').checked, mods=_dssParseMods(document.getElementById('dss-m-mods').value);
  if(wantMod&&!mods.length) return fail('Write at least one phone model (one per line).');
  btn.disabled=true; btn.innerHTML='<i class="ti ti-loader"></i> Saving…'; err.style.display='none';
  try{
    if(DSS.img){ var u=await uploadImg(DSS.img,'menu'); if(!u) return fail('Photo upload failed — try again or save without a photo.'); DSS.imgUrl=u; }
    var row={restaurant_id:DSS.store.id,name:name,category:dep,price:Number(price),discount_price:disc===''?null:Number(disc),description:document.getElementById('dss-m-desc').value.trim()||null,
      image_url:DSS.imgUrl||null,in_stock:document.getElementById('dss-m-instock').checked,is_active:document.getElementById('dss-m-active').checked};
    var r, id=DSS.editId;
    if(id){ r=await sb.from('menu_items').update(row).eq('id',id).select().single(); }
    else{ row.sort_order=DSS.items.length+1; r=await sb.from('menu_items').insert(row).select().single(); }
    if(r.error) throw r.error; id=r.data.id;
    var ex={item_id:id,cost:cost===''?null:Number(cost),stock:stock===''?null:Math.round(Number(stock)),low_at:low===''?3:Math.max(0,Math.round(Number(low))),updated_at:new Date().toISOString()};
    var r2=await sb.from('ds_store_items').upsert(ex,{onConflict:'item_id'});
    if(r2.error) throw r2.error;
    // phone models (customer must choose one)
    var old=DSS.mods[id];
    if(old){ await sb.from('modifier_options').delete().eq('group_id',old.gid); if(!wantMod) await sb.from('modifier_groups').delete().eq('id',old.gid); }
    if(wantMod){ var gid=old&&old.gid;
      if(!gid){ var g=await sb.from('modifier_groups').insert({menu_item_id:id,name:'موديل الجوال',required:true,type:'single',sort_order:1}).select().single(); if(g.error) throw g.error; gid=g.data.id; }
      var r3=await sb.from('modifier_options').insert(mods.map(function(m,k){ return {group_id:gid,name:m.name,extra_price:m.extra,sort_order:k+1}; })); if(r3.error) throw r3.error; }
    closeModal('modal-dss'); showToast(DSS.editId?'✅ Product updated':'✅ Product added'); btn.disabled=false; btn.innerHTML='<i class="ti ti-check"></i> Save product';
    loadDsStore();
  }catch(e){ fail('❌ '+(e&&e.message||e)); }
}
