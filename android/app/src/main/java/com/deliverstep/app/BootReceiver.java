package com.deliverstep.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Restarts the "Online" foreground service after the phone reboots,
 * so riders keep receiving order alerts without reopening the app.
 */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        try {
            if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
                boolean online = context
                        .getSharedPreferences("rider_prefs", Context.MODE_PRIVATE)
                        .getBoolean("online", true);
                if (online) RiderForegroundService.start(context);
            }
        } catch (Exception ignore) {}
    }
}
