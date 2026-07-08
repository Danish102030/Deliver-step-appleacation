package com.deliverstep.app;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    /** True while the app UI is in the foreground (used to avoid duplicate alerts). */
    public static boolean isForeground = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        showWhenLockedAndTurnScreenOn();
        setupNativeBridge();
        // "Go Online" mode: keep the app alive so order alerts always arrive
        // (default ON — riders are online whenever they open the app).
        if (prefs().getBoolean("online", true)) {
            RiderForegroundService.start(this);
            requestBatteryExemptionOnce();
        }
    }

    private SharedPreferences prefs() {
        return getSharedPreferences("rider_prefs", MODE_PRIVATE);
    }

    private void setupNativeBridge() {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().addJavascriptInterface(new RiderNative(), "RiderNative");
            }
        } catch (Exception ignore) {}
    }

    /** Simple bridge so rider.html can toggle Online mode: window.RiderNative.goOnline() etc. */
    public class RiderNative {
        @JavascriptInterface
        public void goOnline() {
            prefs().edit().putBoolean("online", true).apply();
            runOnUiThread(() -> {
                RiderForegroundService.start(MainActivity.this);
                requestBatteryExemptionOnce();
            });
        }

        @JavascriptInterface
        public void goOffline() {
            prefs().edit().putBoolean("online", false).apply();
            runOnUiThread(() -> RiderForegroundService.stop(MainActivity.this));
        }

        @JavascriptInterface
        public boolean isOnline() {
            return prefs().getBoolean("online", true);
        }
    }

    /** Ask Android to exempt us from battery optimization (key for itel/Tecno/Xiaomi). */
    private void requestBatteryExemptionOnce() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())
                        && !prefs().getBoolean("asked_battery", false)) {
                    prefs().edit().putBoolean("asked_battery", true).apply();
                    Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    i.setData(Uri.parse("package:" + getPackageName()));
                    startActivity(i);
                }
            }
        } catch (Exception ignore) {}
    }

    private void showWhenLockedAndTurnScreenOn() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) { // Android 8.1+
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            if (km != null) {
                try { km.requestDismissKeyguard(this, null); } catch (Exception ignore) {}
            }
        } else {
            getWindow().addFlags(
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        isForeground = true;
        // When the app comes to front (e.g. launched from a lock-screen alert),
        // ask the web layer to show the takeover for any fresh unaccepted order.
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().post(() ->
                    getBridge().getWebView().evaluateJavascript(
                        "window.checkFreshOrderOnOpen && window.checkFreshOrderOnOpen();", null));
            }
        } catch (Exception ignore) {}
    }

    @Override
    public void onPause() {
        super.onPause();
        isForeground = false;
    }
}
