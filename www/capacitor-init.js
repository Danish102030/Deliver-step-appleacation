// Capacitor bridge helpers — loaded on every page
(function () {

  // ── Android hardware back button ────────────────────────────────────────────
  document.addEventListener('deviceready', registerBackButton, false);
  window.addEventListener('load', function () {
    document.addEventListener('ionBackButton', handleBack, false);
  });

  function registerBackButton() {
    if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App) {
      Capacitor.Plugins.App.addListener('backButton', handleBack);
    }
  }

  function handleBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App) {
        Capacitor.Plugins.App.minimizeApp();
      }
    }
  }

  // ── Status bar color (rose #be185d) ─────────────────────────────────────────
  document.addEventListener('deviceready', function () {
    if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.StatusBar) {
      Capacitor.Plugins.StatusBar.setBackgroundColor({ color: '#be185d' });
      Capacitor.Plugins.StatusBar.setStyle({ style: 'LIGHT' });
    }
  }, false);

  // ── Push Notifications (Firebase FCM) ───────────────────────────────────────
  document.addEventListener('deviceready', initPushNotifications, false);

  function initPushNotifications() {
    var PushNotifications = window.Capacitor &&
      Capacitor.Plugins &&
      Capacitor.Plugins.PushNotifications;
    if (!PushNotifications) return;

    // Set up ALL listeners first, before any async calls
    PushNotifications.addListener('registration', function (token) {
      saveDeviceToken(token.value);
    });

    PushNotifications.addListener('registrationError', function () {
      // FCM registration failed — likely google-services.json missing or no Play Services
    });

    PushNotifications.addListener('pushNotificationReceived', function (notification) {
      if (notification.title || notification.body) {
        showInAppBanner(notification.title || '', notification.body || '');
      }
    });

    PushNotifications.addListener('pushNotificationActionPerformed', function (action) {
      var data = action.notification.data || {};
      if (data.url) {
        window.location.href = data.url;
      }
    });

    // Check existing permission — if already granted, register immediately
    // (avoids showing permission dialog again on repeat opens)
    var doRegister = function() { PushNotifications.register(); };

    if (PushNotifications.checkPermissions) {
      PushNotifications.checkPermissions().then(function (status) {
        if (status.receive === 'granted') {
          doRegister();
        } else {
          PushNotifications.requestPermissions().then(function (result) {
            if (result.receive === 'granted') doRegister();
          }).catch(function () {});
        }
      }).catch(function () {
        PushNotifications.requestPermissions().then(function (result) {
          if (result.receive === 'granted') doRegister();
        }).catch(function () {});
      });
    } else {
      PushNotifications.requestPermissions().then(function (result) {
        if (result.receive === 'granted') doRegister();
      }).catch(function () {});
    }
  }

  function saveDeviceToken(token) {
    var SUPABASE_URL = 'https://vjuhxpttssmyomqqomdx.supabase.co';
    var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNDIxNTMsImV4cCI6MjA2MzkxODE1M30.5K2yJFPHXdPT6V0kHBpKADJAmnnxQjFZ4lSTtFIluKo';

    var platform = 'android';
    if (window.Capacitor && Capacitor.getPlatform) {
      platform = Capacitor.getPlatform();
    }

    fetch(SUPABASE_URL + '/rest/v1/device_tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        token: token,
        platform: platform,
        last_seen: new Date().toISOString()
      })
    }).then(function(r) {
      if (!r.ok) r.text().then(function(t) { console.error('device_token save failed', r.status, t); });
    }).catch(function (e) { console.error('device_token fetch error', e); });
  }

  function showInAppBanner(title, body) {
    var existing = document.getElementById('_push_banner');
    if (existing) existing.remove();

    var banner = document.createElement('div');
    banner.id = '_push_banner';
    banner.style.cssText = [
      'position:fixed', 'top:16px', 'left:50%', 'transform:translateX(-50%)',
      'background:#be185d', 'color:#fff', 'border-radius:12px',
      'padding:12px 18px', 'max-width:340px', 'width:calc(100% - 32px)',
      'box-shadow:0 4px 20px rgba(0,0,0,0.25)', 'z-index:99999',
      'font-family:sans-serif', 'font-size:13px', 'cursor:pointer',
      'transition:opacity .3s'
    ].join(';');

    banner.innerHTML =
      '<div style="font-weight:600;margin-bottom:2px">' + escHtml(title) + '</div>' +
      '<div style="opacity:.9">' + escHtml(body) + '</div>';

    banner.addEventListener('click', function () { banner.remove(); });
    document.body.appendChild(banner);

    setTimeout(function () {
      banner.style.opacity = '0';
      setTimeout(function () { banner.remove(); }, 300);
    }, 5000);
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

})();
