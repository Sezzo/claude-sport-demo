import SwiftUI

struct SessionStatusView: View {
    @EnvironmentObject var sessionManager: SessionManager
    @EnvironmentObject var hrMonitor: HRMonitor

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Circle()
                    .fill(sessionManager.isConnected ? Color.green : Color.red)
                    .frame(width: 8, height: 8)

                Text(sessionManager.sessionStatus)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            if sessionManager.isConnected {
                Button(action: {
                    sessionManager.stopSendingHRData()
                    hrMonitor.stopMonitoring()
                    sessionManager.leaveSession()
                }) {
                    Text("Stop Session")
                        .font(.caption)
                        .foregroundColor(.red)
                }
                .buttonStyle(.bordered)
            } else {
                Button(action: {
                    hrMonitor.startMonitoring()
                    sessionManager.joinSession("demo-session")
                    sessionManager.startSendingHRData(hrMonitor: hrMonitor)
                }) {
                    Text("Start Training")
                        .font(.caption)
                        .foregroundColor(.green)
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding(.vertical, 8)
    }
}

struct SessionStatusView_Previews: PreviewProvider {
    static var previews: some View {
        SessionStatusView()
            .environmentObject(SessionManager())
            .environmentObject(HRMonitor())
    }
}
