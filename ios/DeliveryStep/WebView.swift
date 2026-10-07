import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        // ── Native haptics bridge ──────────────────────────────────────────────
        // The website calls navigator.vibrate() on "add to cart". iOS Safari ignores
        // that, so we override it to post a message here and fire the Taptic Engine.
        let contentController = WKUserContentController()
        contentController.add(context.coordinator, name: "haptic")
        let hapticJS = """
        (function(){
          function fire(p){ try{ window.webkit.messageHandlers.haptic.postMessage(String(p||'')); }catch(e){} }
          navigator.vibrate = function(p){ fire(p); return true; };
          window.dsHaptic = fire;
        })();
        """
        contentController.addUserScript(
            WKUserScript(source: hapticJS, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        )

        // Tell the website which app version this is (the home page uses it for the "update the app" message).
        let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
        contentController.addUserScript(
            WKUserScript(source: "window.DS_APP_VERSION = '\(appVersion)';", injectionTime: .atDocumentStart, forMainFrameOnly: false)
        )
        config.userContentController = contentController

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.bounces = true
        // Transparent only while the app opens, so the brand-pink behind shows instead of a white flash.
        // After the first page is on screen the web view becomes solid (see didFinish), so moving
        // between pages never shows that pink through the page.
        webView.isOpaque = false

        let refreshControl = UIRefreshControl()
        refreshControl.addTarget(context.coordinator, action: #selector(Coordinator.refresh(_:)), for: .valueChanged)
        context.coordinator.webView = webView
        webView.scrollView.refreshControl = refreshControl

        // Always open the newest pages: first delete the old copies of the website's pages that the
        // phone saved, then load. Login, cart and everything else the site saved are kept.
        let request = URLRequest(url: url)
        var started = false
        let start = {
            guard !started else { return }
            started = true
            webView.load(request)
        }
        // Only after an app update, or once a day (like the Android app): otherwise keep the saved files,
        // so fonts, icons and photos open instantly instead of being downloaded again on every start.
        if WebView.shouldClearSavedPages() {
            WebView.removeSavedPages(then: start)
        } else {
            start()
        }
        // Never keep the customer waiting: open anyway after 3 seconds.
        DispatchQueue.main.asyncAfter(deadline: .now() + 3, execute: start)
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    /// True after an app update, or when the last clean-up was more than a day ago (then remembers now).
    static func shouldClearSavedPages() -> Bool {
        let defaults = UserDefaults.standard
        let info = Bundle.main.infoDictionary
        let version = (info?["CFBundleShortVersionString"] as? String ?? "") + "-" + (info?["CFBundleVersion"] as? String ?? "")
        let now = Date().timeIntervalSince1970
        let updated = defaults.string(forKey: "ds_cleared_version") != version
        let dayOld = now - defaults.double(forKey: "ds_cleared_at") > 24 * 60 * 60
        guard updated || dayOld else { return false }
        defaults.set(version, forKey: "ds_cleared_version")
        defaults.set(now, forKey: "ds_cleared_at")
        return true
    }

    /// Deletes the saved copies of deliverystep.app pages and files (HTML, scripts, pictures),
    /// so every app start shows what was last uploaded to the website. Cookies and localStorage stay.
    static func removeSavedPages(then done: @escaping () -> Void) {
        let store = WKWebsiteDataStore.default()
        let types: Set<String> = [WKWebsiteDataTypeDiskCache, WKWebsiteDataTypeMemoryCache, WKWebsiteDataTypeFetchCache]
        store.fetchDataRecords(ofTypes: types) { records in
            let ours = records.filter { $0.displayName.contains("deliverystep") }
            guard !ours.isEmpty else {
                DispatchQueue.main.async(execute: done)
                return
            }
            store.removeData(ofTypes: types, for: ours) {
                DispatchQueue.main.async(execute: done)
            }
        }
    }

    class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        weak var webView: WKWebView?

        // Fires the native Taptic Engine when the web page requests a haptic.
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "haptic" else { return }
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.prepare()
            generator.impactOccurred()
        }

        @objc func refresh(_ sender: UIRefreshControl) {
            // Pull-to-refresh asks the server again, so a newly uploaded page shows straight away.
            webView?.reloadFromOrigin()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { sender.endRefreshing() }
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else { decisionHandler(.allow); return }
            let host = url.host ?? ""
            if host == "deliverystep.app" || host == "www.deliverystep.app" || host.isEmpty {
                decisionHandler(.allow)
            } else if navigationAction.navigationType == .linkActivated {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
            } else {
                decisionHandler(.allow)
            }
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            webView.scrollView.refreshControl?.endRefreshing()
            if !webView.isOpaque {
                // From now on fill the gap between two pages with the pages' own light grey (#f9f9f9),
                // not the pink behind the web view — no more pink flash on next page / back.
                let pageGrey = UIColor(red: 249/255, green: 249/255, blue: 249/255, alpha: 1)
                webView.isOpaque = true
                webView.backgroundColor = pageGrey
                webView.scrollView.backgroundColor = pageGrey
                if #available(iOS 15.0, *) { webView.underPageBackgroundColor = pageGrey }
            }
            // Hand the push token to the website so checkout can attach it to the order
            // → the customer gets order-status notifications on iPhone.
            if let token = UserDefaults.standard.string(forKey: "ds_push_token"), !token.isEmpty {
                webView.evaluateJavaScript("try{localStorage.setItem('ds_push_token','\(token)');}catch(e){}", completionHandler: nil)
            }
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            webView.scrollView.refreshControl?.endRefreshing()
        }

        // Handle window.open() calls (e.g. WhatsApp links) — open with system app
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = navigationAction.request.url {
                UIApplication.shared.open(url)
            }
            return nil
        }

        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
            topViewController()?.present(alert, animated: true)
        }

        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(false) })
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
            topViewController()?.present(alert, animated: true)
        }

        private func topViewController() -> UIViewController? {
            UIApplication.shared.connectedScenes
                .filter { $0.activationState == .foregroundActive }
                .compactMap { $0 as? UIWindowScene }
                .first?.keyWindow?.rootViewController
        }
    }
}
