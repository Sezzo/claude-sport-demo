import SwiftUI

struct ContentView: View {
    @EnvironmentObject var sessionManager: SessionManager
    @EnvironmentObject var hrMonitor: HRMonitor
    @State private var showingSessionPicker = false

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                if sessionManager.isConnected && hrMonitor.isAuthorized {
                    // Main HR Display
                    HRDisplayView()

                    // Current Zone
                    ZoneIndicatorView()

                    // Session Status
                    SessionStatusView()
                } else {
                    // Setup Required
                    SetupView()
                }
            }
            .navigationTitle("Training")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(SessionManager())
            .environmentObject(HRMonitor())
    }
}
