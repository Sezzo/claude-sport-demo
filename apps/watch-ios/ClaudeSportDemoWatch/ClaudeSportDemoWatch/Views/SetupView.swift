import SwiftUI

struct SetupView: View {
    @EnvironmentObject var sessionManager: SessionManager
    @EnvironmentObject var hrMonitor: HRMonitor

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "heart.fill")
                .font(.system(size: 40))
                .foregroundColor(.red)

            Text("Setup Required")
                .font(.headline)

            if !hrMonitor.isAuthorized {
                VStack(spacing: 8) {
                    Text("Heart rate access needed")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)

                    Button("Allow Access") {
                        hrMonitor.requestAuthorization()
                    }
                    .buttonStyle(.borderedProminent)
                }
            }

            if !sessionManager.isConnected {
                VStack(spacing: 8) {
                    Text("Connect to iPhone")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)

                    if let error = sessionManager.error {
                        Text(error)
                            .font(.caption2)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                    }

                    Text(sessionManager.sessionStatus)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
    }
}

struct SetupView_Previews: PreviewProvider {
    static var previews: some View {
        SetupView()
            .environmentObject(SessionManager())
            .environmentObject(HRMonitor())
    }
}
