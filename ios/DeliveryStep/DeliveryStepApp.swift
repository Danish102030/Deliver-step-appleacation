import SwiftUI
import UIKit
import FirebaseCore
import FirebaseMessaging
import UserNotifications

@main
struct DeliveryStepApp: App {
    // Bridge a classic AppDelegate into SwiftUI so we can handle push notifications.
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

// Handles Firebase Cloud Messaging + Apple Push Notifications for the customer app.
// NOTE: this build shows small "Push Debug" popups on purpose, to reveal exactly what
// happens with the token. They are temporary and will be removed once it's confirmed working.
final class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        // Configure Firebase in code (values from GoogleService-Info.plist).
        let options = FirebaseOptions(googleAppID: "1:909895024559:ios:4ac5832689ac15a6c1395a",
                                      gcmSenderID: "909895024559")
        options.apiKey = "AIzaSyA6kSwzlrkMAY2gZgAfWqqPs2yfydMDpRo"
        options.projectID = "delivery-step-7a9ad"
        options.bundleID = "com.deliverystep.app"
        options.storageBucket = "delivery-step-7a9ad.firebasestorage.app"
        FirebaseApp.configure(options: options)

        Messaging.messaging().delegate = self
        UNUserNotificationCenter.current().delegate = self

        // Ask permission, then register with APNs.
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if let error = error {
                self.showDebug("❌ Permission error:\n\(error.localizedDescription)")
            }
            guard granted else {
                self.showDebug("⚠️ Notifications are NOT allowed. Turn them on in iPhone Settings → خطوة التوصيل → Notifications, then reopen the app.")
                return
            }
            DispatchQueue.main.async {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }

        // Belt-and-suspenders: explicitly fetch the FCM token a few seconds after launch,
        // and report the exact result on-screen.
        DispatchQueue.main.asyncAfter(deadline: .now() + 6) {
            Messaging.messaging().token { token, error in
                if let error = error {
                    self.showDebug("❌ FCM token error:\n\(error.localizedDescription)")
                } else if let token = token, !token.isEmpty {
                    self.showDebug("✅ FCM token ready:\n\(token.prefix(24))…\n\nSaving to your database now.")
                    self.saveDeviceToken(token)
                } else {
                    self.showDebug("⚠️ FCM token came back empty. (APNs may not be linked yet — reopen once more.)")
                }
            }
        }
        return true
    }

    // APNs device token -> hand to Firebase Messaging.
    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken
    }

    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        showDebug("❌ APNs registration failed:\n\(error.localizedDescription)")
    }

    // FCM token via the delegate (fires on refresh) -> also save.
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let token = fcmToken, !token.isEmpty else { return }
        saveDeviceToken(token)
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .list, .badge, .sound])
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        completionHandler()
    }

    // Save this device's FCM token to Supabase device_tokens (same format as the Android app),
    // and report the exact HTTP result on-screen.
    private func saveDeviceToken(_ token: String) {
        let anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNDIxNTMsImV4cCI6MjA2MzkxODE1M30.5K2yJFPHXdPT6V0kHBpKADJAmnnxQjFZ4lSTtFIluKo"
        guard let url = URL(string: "https://vjuhxpttssmyomqqomdx.supabase.co/rest/v1/device_tokens") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue(anonKey, forHTTPHeaderField: "apikey")
        req.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")
        req.setValue("resolution=merge-duplicates", forHTTPHeaderField: "Prefer")
        let body: [String: Any] = [
            "token": token,
            "platform": "ios",
            "last_seen": ISO8601DateFormatter().string(from: Date())
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])
        URLSession.shared.dataTask(with: req) { data, response, error in
            if let error = error {
                self.showDebug("❌ Save failed (network):\n\(error.localizedDescription)")
                return
            }
            let code = (response as? HTTPURLResponse)?.statusCode ?? 0
            let bodyStr = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
            if (200...299).contains(code) {
                self.showDebug("🎉 Saved to database! (HTTP \(code))\n\nCheck your admin — the iPhone count should now go up.")
            } else {
                self.showDebug("❌ Database rejected the save: HTTP \(code)\n\(bodyStr.prefix(220))")
            }
        }.resume()
    }

    // Show a small popup so we can see what's happening (temporary diagnostic).
    private func showDebug(_ msg: String) {
        DispatchQueue.main.async {
            let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
            let windows = scenes.flatMap { $0.windows }
            guard let window = windows.first(where: { $0.isKeyWindow }) ?? windows.first,
                  var top = window.rootViewController else { return }
            while let presented = top.presentedViewController { top = presented }
            let alert = UIAlertController(title: "Push Debug", message: msg, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            top.present(alert, animated: true)
        }
    }
}
