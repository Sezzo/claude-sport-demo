# watchOS Companion App

## Status
🚧 **Placeholder - To Be Implemented**

This directory will contain the watchOS companion app for Apple Watch integration.

## Planned Features

### Core Functionality
- [ ] Heart rate monitoring using HealthKit
- [ ] Real-time HR data transmission to mobile app
- [ ] Zone indicator on watch face
- [ ] Workout session controls
- [ ] Haptic feedback for zone changes

### Technical Stack
- SwiftUI for watch interface
- HealthKit for HR data
- WatchConnectivity for iOS app communication
- Background delivery for continuous monitoring

## Architecture

```
apps/watch-ios/
├── ClaudeSportDemoWatch/
│   ├── ContentView.swift      # Main watch UI
│   ├── HRMonitor.swift         # HealthKit integration
│   ├── SessionManager.swift    # Workout session management
│   └── ZoneIndicator.swift     # Visual zone feedback
├── ClaudeSportDemoWatch Extension/
│   └── ComplicationController.swift
└── Assets.xcassets/
```

## HealthKit Integration

### Required Capabilities
- Heart Rate reading
- Workout session
- Background delivery

### Privacy Descriptions (Info.plist)
```xml
<key>NSHealthShareUsageDescription</key>
<string>We need access to your heart rate to provide zone-based coaching during workouts</string>
```

## Implementation Roadmap

### Phase 1: Basic HR Monitoring
- Setup HealthKit authorization
- Read heart rate data
- Display current BPM on watch

### Phase 2: Zone Coaching
- Calculate HR zones based on user max HR
- Display current zone with color coding
- Haptic feedback on zone changes

### Phase 3: Session Integration
- Connect to mobile app via WatchConnectivity
- Sync session state
- Send HR data to backend via mobile app

### Phase 4: Complications & Notifications
- Watch face complication showing current zone
- Notifications for zone targets
- Workout summaries

## Development Setup

```bash
# Install Xcode 15+
# Open ClaudeSportDemoWatch.xcodeproj

# Build for simulator
xcodebuild -scheme ClaudeSportDemoWatch \
  -destination 'platform=watchOS Simulator,name=Apple Watch Series 9 (45mm)' \
  build
```

## Data Flow

```
Apple Watch (HealthKit)
    ↓ Heart Rate Data
WatchConnectivity
    ↓
iOS App (Socket.IO)
    ↓
Backend API
    ↓ Broadcast
All Session Participants
```

## Compliance

✅ **Privacy Compliant**
- Clear HealthKit usage descriptions
- User consent before accessing HR data
- No HR data stored locally on watch
- Data transmitted securely

## Resources

- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [WatchConnectivity Framework](https://developer.apple.com/documentation/watchconnectivity)
- [SwiftUI for watchOS](https://developer.apple.com/documentation/swiftui)

---

**Next Steps**: Implement basic HR monitoring and zone display
