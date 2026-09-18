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
// The FCM token is saved to Supabase device_tokens (platform "ios") so notify.php can reach iPhones.
final class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        let options = FirebaseOptions(googleAppID: "1:909895024559:ios:4ac5832689ac15a6c1395a",
                                      gcmSenderID: "909895024559")
        options.apiKey = "AIzaSyA6kSwzlrkMAY2gZgAfWqqPs2yfydMDpRo"
        options.projectID = "delivery-step-7a9ad"
        options.bundleID = "com.deliverystep.app"
        options.storageBucket = "delivery-step-7a9ad.firebasestorage.app"
        FirebaseApp.configure(options: options)

        Messaging.messaging().delegate = self
        UNUserNotificationCenter.current().delegate = self

        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
            guard granted else { return }
            DispatchQueue.main.async {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }

        // Also fetch the token explicitly shortly after launch, in case the delegate is delayed.
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
            Messaging.messaging().token { token, _ in
                if let token = token, !token.isEmpty { self.saveDeviceToken(token) }
            }
        }
        return true
    }

    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken
    }

    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("[Push] APNs registration failed: \(error.localizedDescription)")
    }

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
        // Count this tap as a click so the admin's click count + open rate work on iPhone too.
        let info = response.notification.request.content.userInfo
        if let nid = (info["notif_id"] as? String) ?? notifIdFromURL(info["url"]) {
            reportNotifClick(nid)
        }
        completionHandler()
    }

    // Save this device's FCM token to Supabase device_tokens (same format as the Android app).
    private func saveDeviceToken(_ token: String) {
        let anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MjQxNjAsImV4cCI6MjA5NDUwMDE2MH0.JiGnmOEPPM3dka-KHIm5mEFs7GWb4Amsnp6R57r7Lro"
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
        URLSession.shared.dataTask(with: req).resume()
    }

    // Report a notification tap to Supabase so the admin sees clicks + open rate on iPhone.
    private func reportNotifClick(_ nid: String) {
        let anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MjQxNjAsImV4cCI6MjA5NDUwMDE2MH0.JiGnmOEPPM3dka-KHIm5mEFs7GWb4Amsnp6R57r7Lro"
        guard !nid.isEmpty,
              let url = URL(string: "https://vjuhxpttssmyomqqomdx.supabase.co/rest/v1/rpc/increment_notif_click") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue(anonKey, forHTTPHeaderField: "apikey")
        req.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["nid": nid], options: [])
        URLSession.shared.dataTask(with: req).resume()
    }

    // Fallback: pull the notification id (?n=...) out of the data url.
    private func notifIdFromURL(_ any: Any?) -> String? {
        guard let s = any as? String,
              let comps = URLComponents(string: s) else { return nil }
        return comps.queryItems?.first(where: { $0.name == "n" })?.value
    }
}
