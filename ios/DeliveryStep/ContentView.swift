import SwiftUI
import Network

struct ContentView: View {
    @State private var isLoading = true
    @State private var isOffline = false
    private let monitor = NWPathMonitor()

    var body: some View {
        ZStack {
            // Pink fills safe area top (status bar background on all pages)
            Color(red: 190/255, green: 24/255, blue: 93/255)
                .ignoresSafeArea()

            WebView(url: URL(string: "https://deliverystep.app/")!)
                .ignoresSafeArea(edges: .bottom)

            if isLoading {
                ZStack {
                    Color(red: 190/255, green: 24/255, blue: 93/255)
                        .ignoresSafeArea()
                    VStack(spacing: 16) {
                        Text("خطوة")
                            .font(.system(size: 48, weight: .black))
                            .foregroundColor(.white)
                        Text("DELIVER STEP")
                            .font(.system(size: 13, weight: .semibold))
                            .tracking(4)
                            .foregroundColor(.white.opacity(0.85))
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.2)
                            .padding(.top, 8)
                    }
                }
                .transition(.opacity)
            }

            if isOffline {
                ZStack {
                    Color(.systemBackground).ignoresSafeArea()
                    VStack(spacing: 20) {
                        Image(systemName: "wifi.slash")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("لا يوجد اتصال بالإنترنت")
                            .font(.title3).fontWeight(.semibold)
                        Text("No Internet Connection")
                            .font(.subheadline).foregroundColor(.secondary)
                        Button(action: retry) {
                            Label("Retry", systemImage: "arrow.clockwise")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 32)
                                .padding(.vertical, 12)
                                .background(Color(red: 190/255, green: 24/255, blue: 93/255))
                                .cornerRadius(12)
                        }
                    }
                }
            }
        }
        .onAppear {
            // Force white status bar text so it's visible on the pink background
            if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                scene.windows.forEach { $0.overrideUserInterfaceStyle = .dark }
            }
            checkNetwork()
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                withAnimation(.easeOut(duration: 0.4)) { isLoading = false }
            }
        }
    }

    func checkNetwork() {
        monitor.pathUpdateHandler = { path in
            DispatchQueue.main.async {
                isOffline = path.status != .satisfied
            }
        }
        monitor.start(queue: DispatchQueue(label: "NetworkMonitor"))
    }

    func retry() {
        isOffline = false
        isLoading = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            withAnimation { isLoading = false }
        }
    }
}
