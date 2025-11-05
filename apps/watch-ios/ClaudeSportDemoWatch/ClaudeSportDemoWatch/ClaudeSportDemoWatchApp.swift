import SwiftUI

@main
struct ClaudeSportDemoWatchApp: App {
    @StateObject private var sessionManager = SessionManager()
    @StateObject private var hrMonitor = HRMonitor()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(sessionManager)
                .environmentObject(hrMonitor)
        }
    }
}
