import Foundation
import HealthKit
import Combine

class HRMonitor: NSObject, ObservableObject {
    @Published var currentBPM: Int = 0
    @Published var isAuthorized: Bool = false
    @Published var isMonitoring: Bool = false
    @Published var error: String?

    private let healthStore = HKHealthStore()
    private var heartRateQuery: HKQuery?
    private var timer: Timer?

    // HR Max for zone calculation (should come from user profile)
    var hrMax: Int = 190

    override init() {
        super.init()
        checkAuthorization()
    }

    // MARK: - Authorization

    func checkAuthorization() {
        guard HKHealthStore.isHealthDataAvailable() else {
            error = "Health data not available"
            return
        }

        let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate)!

        healthStore.getRequestStatusForAuthorization(toShare: [], read: [heartRateType]) { status, error in
            DispatchQueue.main.async {
                if error != nil {
                    self.error = "Authorization check failed"
                    return
                }

                switch status {
                case .shouldRequest:
                    self.requestAuthorization()
                case .unnecessary:
                    self.isAuthorized = true
                default:
                    self.requestAuthorization()
                }
            }
        }
    }

    func requestAuthorization() {
        let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate)!

        healthStore.requestAuthorization(toShare: [], read: [heartRateType]) { success, error in
            DispatchQueue.main.async {
                if success {
                    self.isAuthorized = true
                    self.error = nil
                } else {
                    self.error = error?.localizedDescription ?? "Authorization denied"
                }
            }
        }
    }

    // MARK: - Monitoring

    func startMonitoring() {
        guard isAuthorized else {
            error = "Not authorized"
            return
        }

        guard !isMonitoring else { return }

        let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate)!

        let predicate = HKQuery.predicateForSamples(
            withStart: Date(),
            end: nil,
            options: .strictStartDate
        )

        let query = HKAnchoredObjectQuery(
            type: heartRateType,
            predicate: predicate,
            anchor: nil,
            limit: HKObjectQueryNoLimit
        ) { [weak self] query, samples, deletedObjects, anchor, error in
            self?.processSamples(samples)
        }

        query.updateHandler = { [weak self] query, samples, deletedObjects, anchor, error in
            self?.processSamples(samples)
        }

        healthStore.execute(query)
        heartRateQuery = query
        isMonitoring = true
    }

    func stopMonitoring() {
        if let query = heartRateQuery {
            healthStore.stop(query)
            heartRateQuery = nil
        }
        isMonitoring = false
    }

    private func processSamples(_ samples: [HKSample]?) {
        guard let heartRateSamples = samples as? [HKQuantitySample] else { return }

        guard let sample = heartRateSamples.first else { return }

        let heartRateUnit = HKUnit.count().unitDivided(by: HKUnit.minute())
        let bpm = sample.quantity.doubleValue(for: heartRateUnit)

        DispatchQueue.main.async {
            self.currentBPM = Int(bpm)
        }
    }

    // MARK: - Zone Calculation

    func getCurrentZone() -> Zone {
        let percent = Double(currentBPM) / Double(hrMax) * 100.0

        if percent < 50 { return .white }
        if percent < 60 { return .grey }
        if percent < 70 { return .blue }
        if percent < 80 { return .green }
        if percent < 90 { return .yellow }
        return .red
    }

    func getPercentOfMax() -> Int {
        return Int((Double(currentBPM) / Double(hrMax)) * 100.0)
    }
}

// MARK: - Zone Definition

enum Zone: String, CaseIterable {
    case white = "Recovery"
    case grey = "Easy"
    case blue = "Aerobic"
    case green = "Tempo"
    case yellow = "Threshold"
    case red = "VO2 Max"

    var emoji: String {
        switch self {
        case .white: return "⚪"
        case .grey: return "⚫️"
        case .blue: return "🔵"
        case .green: return "🟢"
        case .yellow: return "🟡"
        case .red: return "🔴"
        }
    }

    var color: Color {
        switch self {
        case .white: return .white
        case .grey: return .gray
        case .blue: return .blue
        case .green: return .green
        case .yellow: return .yellow
        case .red: return .red
        }
    }

    var range: String {
        switch self {
        case .white: return "0-50%"
        case .grey: return "50-59%"
        case .blue: return "60-69%"
        case .green: return "70-79%"
        case .yellow: return "80-89%"
        case .red: return "90-100%"
        }
    }
}
