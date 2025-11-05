# Wear OS Companion App

## Status
🚧 **Placeholder - To Be Implemented**

This directory will contain the Wear OS companion app for Android Wear integration.

## Planned Features

### Core Functionality
- [ ] Heart rate monitoring using Health Services API
- [ ] Real-time HR data transmission to mobile app
- [ ] Zone indicator on watch face
- [ ] Workout session controls
- [ ] Vibration patterns for zone changes

### Technical Stack
- Jetpack Compose for watch UI
- Health Services API for HR data
- Wear OS Data Layer for phone communication
- Foreground service for continuous monitoring

## Architecture

```
apps/watch-android/
├── app/
│   ├── src/main/
│   │   ├── kotlin/com/claude/sportdemo/watch/
│   │   │   ├── MainActivity.kt
│   │   │   ├── HRMonitorService.kt
│   │   │   ├── SessionViewModel.kt
│   │   │   └── ui/
│   │   │       ├── ZoneIndicatorScreen.kt
│   │   │       └── theme/
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
└── settings.gradle
```

## Health Services Integration

### Required Permissions (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.BODY_SENSORS" />
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-feature android:name="android.hardware.sensor.heartrate" android:required="true" />
```

### Health Services Gradle Dependency
```gradle
implementation "androidx.health:health-services-client:1.0.0-rc01"
```

## Implementation Roadmap

### Phase 1: Basic HR Monitoring
- Setup Health Services client
- Request body sensors permission
- Read heart rate data
- Display current BPM on watch

### Phase 2: Zone Coaching
- Calculate HR zones based on user profile
- Display current zone with Material You colors
- Vibration patterns for zone changes
- Tile complication for quick access

### Phase 3: Session Integration
- Connect to phone app via Data Layer
- Sync session state
- Send HR data to backend via phone app
- Handle watch-only mode (optional)

### Phase 4: Complications & Notifications
- Watch face complication showing current zone
- Notifications for zone targets
- Workout summary cards

## Development Setup

```bash
# Setup Android Studio with Wear OS SDK
# Install Wear OS emulator (API 30+)

# Build and run
cd apps/watch-android
./gradlew installDebug
adb -d shell am start -n com.claude.sportdemo.watch/.MainActivity
```

## Data Flow

```
Wear OS (Health Services)
    ↓ Heart Rate Data
Data Layer API
    ↓
Android App (Socket.IO)
    ↓
Backend API
    ↓ Broadcast
All Session Participants
```

## Wear OS Specific Features

### Tiles
Quick access tile showing:
- Current BPM
- Current zone
- Quick start button

### Complications
Watch face complications:
- Current zone color
- BPM number
- Session status

### Always-On Display
Low-power display showing:
- Current BPM (updated every 5s)
- Zone color indicator
- Battery-efficient rendering

## Compliance

✅ **Privacy Compliant**
- Clear body sensors permission rationale
- User consent before accessing HR data
- Foreground service notification
- Data transmitted securely

✅ **Battery Efficient**
- Batch HR readings
- Efficient sensor sampling rate
- Sleep when watch is not worn
- Stop monitoring when session ends

## Resources

- [Health Services API](https://developer.android.com/training/wearables/health-services)
- [Wear OS Data Layer](https://developer.android.com/training/wearables/data/data-layer)
- [Jetpack Compose for Wear OS](https://developer.android.com/training/wearables/compose)
- [Wear OS Tiles](https://developer.android.com/training/wearables/tiles)

## Sample Code Structure

### HRMonitorService.kt
```kotlin
class HRMonitorService : Service() {
    private lateinit var healthServicesClient: HealthServicesClient

    fun startMonitoring() {
        // Register for heart rate updates
        // Send data to phone via DataClient
    }
}
```

### ZoneIndicatorScreen.kt
```kotlin
@Composable
fun ZoneIndicatorScreen(bpm: Int, zone: Zone) {
    // Material You themed zone display
    // Large BPM text
    // Color-coded background
}
```

---

**Next Steps**: Implement basic HR monitoring and zone display using Health Services API
