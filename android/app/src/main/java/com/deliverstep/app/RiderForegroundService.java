package com.deliverstep.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;

/**
 * Lightweight foreground service that keeps the rider app process alive
 * while the rider is on shift ("Online"), exactly like Uber/Keeta's
 * "You're online" mode. With the process alive, FCM data messages are
 * delivered instantly and the full-screen order alert can always launch —
 * even on aggressive battery-killer phones (itel/Tecno/Xiaomi).
 */
public class RiderForegroundService extends Service {

    public static final String CHANNEL_ID = "rider_online";
    private static final int NOTIF_ID = 3001;
    public static volatile boolean running = false;

    public static void start(Context ctx) {
        try {
            Intent i = new Intent(ctx, RiderForegroundService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ctx.startForegroundService(i);
            } else {
                ctx.startService(i);
            }
        } catch (Exception ignore) {}
    }

    public static void stop(Context ctx) {
        try {
            ctx.stopService(new Intent(ctx, RiderForegroundService.class));
        } catch (Exception ignore) {}
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Notification n = buildNotification();
        try {
            if (Build.VERSION.SDK_INT >= 34) {
                startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            } else {
                startForeground(NOTIF_ID, n);
            }
            running = true;
        } catch (Exception ignore) {}
        return START_STICKY; // system restarts us if killed
    }

    @Override
    public void onDestroy() {
        running = false;
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private Notification buildNotification() {
        Intent launch = new Intent(this, MainActivity.class);
        launch.setAction(Intent.ACTION_MAIN);
        launch.addCategory(Intent.CATEGORY_LAUNCHER);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) piFlags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pi = PendingIntent.getActivity(this, 3002, launch, piFlags);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(getApplicationInfo().icon)
                .setContentTitle("🟢 أنت متصل — خطوة التوصيل")
                .setContentText("بانتظار الطلبات الجديدة 🛵")
                .setOngoing(true)
                .setSilent(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setContentIntent(pi)
                .build();
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null || nm.getNotificationChannel(CHANNEL_ID) != null) return;
            NotificationChannel ch = new NotificationChannel(CHANNEL_ID, "وضع الاتصال (متصل)",
                    NotificationManager.IMPORTANCE_LOW); // quiet, no sound
            ch.setDescription("يُبقي التطبيق جاهزاً لاستقبال الطلبات فوراً");
            ch.setShowBadge(false);
            nm.createNotificationChannel(ch);
        }
    }
}
