package com.deliverstep.app;

import android.app.KeyguardManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

/**
 * Handles incoming FCM order alerts. For a new order it fires a full-screen
 * intent notification (like an incoming call) so the phone wakes and shows
 * the accept screen over the lock screen — even when the app was closed.
 */
public class OrderMessagingService extends FirebaseMessagingService {

    private static final String CHANNEL_ID = "orders_urgent";
    private static final int NOTIF_ID = 2001;

    @Override
    public void onMessageReceived(RemoteMessage message) {
        Map<String, String> data = message.getData();

        String title = data.get("title");
        String body = data.get("body");
        if ((title == null || title.isEmpty()) && message.getNotification() != null) {
            title = message.getNotification().getTitle();
        }
        if ((body == null || body.isEmpty()) && message.getNotification() != null) {
            body = message.getNotification().getBody();
        }
        if (title == null || title.isEmpty()) title = "طلب جديد";
        if (body == null || body.isEmpty()) body = "لديك طلب جديد";

        // If the app is already open in the foreground, the in-app takeover
        // (driven by the realtime subscription) handles it — avoid a duplicate.
        if (MainActivity.isForeground) return;

        showFullScreenAlert(title, body, data.get("order_id"));
        wakeScreen();
        launchDirectlyIfPermitted(data.get("order_id"));
    }

    /** Force the screen on so the alert is visible immediately. */
    private void wakeScreen() {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                PowerManager.WakeLock wl = pm.newWakeLock(
                        PowerManager.FULL_WAKE_LOCK
                                | PowerManager.ACQUIRE_CAUSES_WAKEUP
                                | PowerManager.ON_AFTER_RELEASE,
                        "deliverystep:order_alert");
                wl.acquire(10000);
            }
        } catch (Exception ignore) {}
    }

    /**
     * OEMs like itel/Tecno/Xiaomi often swallow full-screen intents. Apps with
     * the "Display over other apps" permission are exempt from Android's
     * background-activity-launch restriction, so we open the accept screen
     * directly — the guaranteed path used by delivery/VoIP apps.
     */
    private void launchDirectlyIfPermitted(String orderId) {
        try {
            boolean canOverlay = Build.VERSION.SDK_INT < Build.VERSION_CODES.M
                    || Settings.canDrawOverlays(this);
            if (!canOverlay) return;
            Intent launch = new Intent(this, MainActivity.class);
            launch.setAction(Intent.ACTION_MAIN);
            launch.addCategory(Intent.CATEGORY_LAUNCHER);
            launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            if (orderId != null) launch.putExtra("open_order", orderId);
            startActivity(launch);
        } catch (Exception ignore) {}
    }

    private void showFullScreenAlert(String title, String body, String orderId) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        createChannel(nm);

        Intent launch = new Intent(this, MainActivity.class);
        launch.setAction(Intent.ACTION_MAIN);
        launch.addCategory(Intent.CATEGORY_LAUNCHER);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (orderId != null) launch.putExtra("open_order", orderId);

        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            piFlags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pi = PendingIntent.getActivity(this, 1001, launch, piFlags);

        NotificationCompat.Builder b = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(getApplicationInfo().icon)
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true)
                .setOngoing(false)
                .setContentIntent(pi)
                .setFullScreenIntent(pi, true)
                .setDefaults(NotificationCompat.DEFAULT_ALL);

        nm.notify(NOTIF_ID, b.build());
    }

    private void createChannel(NotificationManager nm) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = nm.getNotificationChannel(CHANNEL_ID);
            if (ch != null) return;
            ch = new NotificationChannel(CHANNEL_ID, "طلبات جديدة",
                    NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("تنبيه فوري بالطلبات الجديدة");
            ch.enableVibration(true);
            ch.setVibrationPattern(new long[]{0, 500, 250, 500, 250, 500});
            ch.enableLights(true);
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            try { ch.setBypassDnd(true); } catch (Exception ignore) {}

            AudioAttributes att = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
            Uri sound = Settings.System.DEFAULT_RINGTONE_URI;
            ch.setSound(sound, att);

            nm.createNotificationChannel(ch);
        }
    }
}
