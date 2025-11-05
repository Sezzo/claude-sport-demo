import Foundation
import WatchConnectivity
import Combine

class SessionManager: NSObject, ObservableObject {
    @Published var isConnected: Bool = false
    @Published var currentSessionId: String?
    @Published var sessionStatus: String = "Disconnected"
    @Published var error: String?

    private var session: WCSession?
    private var hrMonitor: HRMonitor?
    private var timer: Timer?

    override init() {
        super.init()
        setupWatchConnectivity()
    }

    // MARK: - WatchConnectivity Setup

    private func setupWatchConnectivity() {
        if WCSession.isSupported() {
            session = WCSession.default
            session?.delegate = self
            session?.activate()
        }
    }

    // MARK: - Session Management

    func joinSession(_ sessionId: String) {
        guard let session = session, session.isReachable else {
            error = "iPhone not reachable"
            return
        }

        let message: [String: Any] = [
            "action": "joinSession",
            "sessionId": sessionId,
            "userId": "watch-user"
        ]

        session.sendMessage(message, replyHandler: { reply in
            DispatchQueue.main.async {
                self.currentSessionId = sessionId
                self.sessionStatus = "Connected to \(sessionId)"
                self.isConnected = true
                self.error = nil
            }
        }, errorHandler: { error in
            DispatchQueue.main.async {
                self.error = error.localizedDescription
            }
        })
    }

    func leaveSession() {
        stopSendingHRData()
        currentSessionId = nil
        sessionStatus = "Disconnected"
        isConnected = false
    }

    // MARK: - HR Data Transmission

    func startSendingHRData(hrMonitor: HRMonitor) {
        self.hrMonitor = hrMonitor

        // Send HR data every second
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.sendHRUpdate()
        }
    }

    func stopSendingHRData() {
        timer?.invalidate()
        timer = nil
    }

    private func sendHRUpdate() {
        guard let session = session,
              let hrMonitor = hrMonitor,
              let sessionId = currentSessionId,
              session.isReachable else {
            return
        }

        let message: [String: Any] = [
            "action": "hrUpdate",
            "sessionId": sessionId,
            "userId": "watch-user",
            "bpm": hrMonitor.currentBPM,
            "timestamp": Date().timeIntervalSince1970,
            "device": "Apple Watch"
        ]

        // Use transferUserInfo for background delivery
        session.transferUserInfo(message)
    }
}

// MARK: - WCSessionDelegate

extension SessionManager: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            if let error = error {
                self.error = error.localizedDescription
            } else {
                switch activationState {
                case .activated:
                    self.sessionStatus = "Ready"
                case .inactive:
                    self.sessionStatus = "Inactive"
                case .notActivated:
                    self.sessionStatus = "Not Activated"
                @unknown default:
                    self.sessionStatus = "Unknown"
                }
            }
        }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        DispatchQueue.main.async {
            // Handle messages from iPhone
            if let action = message["action"] as? String {
                switch action {
                case "sessionStarted":
                    self.sessionStatus = "Session Active"
                case "sessionEnded":
                    self.leaveSession()
                default:
                    break
                }
            }
        }
    }

    func session(_ session: WCSession, didReceiveUserInfo userInfo: [String : Any] = [:]) {
        // Handle background data from iPhone
        DispatchQueue.main.async {
            print("Received user info: \(userInfo)")
        }
    }
}
