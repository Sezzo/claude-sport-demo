# Android Setup

## Prerequisites
- Android Studio
- JDK 17+
- Android SDK (API 34)
- Gradle 8.x

## Installation

```bash
cd apps/mobile
pnpm install
```

## Running

```bash
# Start Metro bundler
pnpm start

# In another terminal, run Android
pnpm android

# Or with specific device
pnpm android -- --deviceId=emulator-5554
```

## Building for Release

```bash
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

## YouTube ToS Compliance

This Android app is configured to display YouTube videos in a visible player:
- ✅ Video playback is always visible
- ✅ No background audio playback for YouTube content
- ✅ FEATURE_AUDIO_ONLY_MOBILE manifest flag set to false
- ✅ Background wake lock limited to API 22 and below

## Testing

```bash
# Unit tests
./gradlew test

# Instrumentation tests
./gradlew connectedAndroidTest
```

## Troubleshooting

### Build Fails
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Metro Bundler Issues
```bash
pnpm start -- --reset-cache
```

### Gradle Issues
```bash
cd android
./gradlew --stop
./gradlew clean
```

## ProGuard Rules

For release builds, ensure YouTube player classes are not obfuscated by adding to `proguard-rules.pro`:

```proguard
-keep class com.google.android.youtube.** { *; }
-keep class com.pierfrancescosoffritti.androidyoutubeplayer.** { *; }
```
