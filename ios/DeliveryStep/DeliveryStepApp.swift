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
// The FCM token is saved to Supabase `device_tokens` (platform "ios") so the existing
// notify.php sender can reach iPhones — exactly like the Android app already does.
final class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        // Configure Firebase in code (no GoogleService-Info.plist needed in the bundle).
        // Values come straight from the project's GoogleService-Info.plist.
        let options = FirebaseOptions(googleAppID: "1:909895024559:ios:4ac5832689ac15a6c1395a",
                                      gcmSenderID: "909895024559")
        options.apiKey = "AIzaSyA6kSwzlrkMAY2gZgAfWqqPs2yfydMDpRo"
        options.projectID = "delivery-step-7a9ad"
        options.bundleID = "com.deliverystep.app"
        options.storageBucket = "delivery-step-7a9ad.firebasestorage.app"
        FirebaseApp.configure(options: options)

        Messaging.messaging().delegate = self
        UNUserNotificationCenter.current().delegate = self

        // Ask the customer for notification permission, then register with APNs.
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
            guard granted else { return }
            DispatchQueue.main.async {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }
        return true
    }

    // APNs device token -> hand it to Firebase Messaging.
    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken
    }

    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("[Push] APNs registration failed: \(error.localizedDescription)")
    }

    // Firebase FCM token -> save to Supabase so notify.php can reach this iPhone.
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let token = fcmToken else { return }
        saveDeviceToken(token)
    }

    // Show the notification banner even when the app is open in the foreground.
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .list, .badge, .sound])
    }

    // Tapping a notification: open the deep-link URL if the payload has one.
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        completionHandler()
    }

    // Save this device's FCM token to Supabase device_tokens (same format as the Android app).
    private func saveDeviceToken(_ token: String) {
        let anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWh4cHR0c3NteW9tcXFvbWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNDIxNTMsImV4cCI6MjA2MzkxODE1M30.5K2yJFPHXdPT6V0kHBpKADJAmnnxQjFZ4lSTtFIluKo"
        guard let url = URL(string: "https://vjuhxpttssmyomqqomdx.supabase.co/rest/v1/device_tokens") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue(anonKey, forHTTPHeaderField: "apikey")
        req.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")
        req.setValue("resolution=merge-duplicates", forHTTPHeaderField: "Prefer") // upsert
        let body: [String: Any] = [
            "token": token,
            "platform": "ios",
            "last_seen": ISO8601DateFormatter().string(from: Date())
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])
        URLSession.shared.dataTask(with: req).resume()
    }
}
