import SwiftUI
import Network

struct ContentView: View {
    @State private var isOffline = false
    @State private var networkStarted = false
    private let monitor = NWPathMonitor()

    var body: some View {
        ZStack {
            // Pink fills safe area top (status bar background on all pages)
            Color(red: 190/255, green: 24/255, blue: 93/255)
                .ignoresSafeArea()

            WebView(url: URL(string: "https://deliverystep.app/")!)
                .ignoresSafeArea(edges: .bottom)

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
            checkNetwork()
        }
    }

    func checkNetwork() {
        guard !networkStarted else { return }
        networkStarted = true
        monitor.pathUpdateHandler = { path in
            DispatchQueue.main.async {
                isOffline = path.status != .satisfied
            }
        }
        monitor.start(queue: DispatchQueue(label: "NetworkMonitor"))
    }

    func retry() {
        isOffline = false
    }
}
