# Mobile App (React Native)

Complete mobile application for synchronized YouTube training with heart rate zones.

## Features

✅ **Synchronized Video Playback**
- YouTube video player (visible, ToS-compliant)
- Real-time sync with other participants via WebSocket
- Play, Pause, Seek controls broadcasted to all clients

✅ **Heart Rate Integration**
- Display live heart rate data
- Zone-based coaching with color coding
- Auto-detection of current training zone

✅ **COLOUR CODE Parser**
- Parse YouTube descriptions for workout segments
- Visual timeline of training zones
- Quick navigation to any segment

✅ **Session Management**
- Create new training sessions
- Join existing sessions by ID
- Multi-user synchronization

## Tech Stack

- **Framework**: React Native 0.76.6 (Bare workflow)
- **Navigation**: React Navigation 6
- **YouTube**: react-native-youtube-iframe
- **WebSocket**: Socket.IO Client
- **State**: React Hooks
- **TypeScript**: Full type safety

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- For iOS: Xcode 14+, CocoaPods
- For Android: Android Studio, JDK 17+

### Installation

```bash
# From monorepo root
cd apps/mobile
pnpm install

# iOS: Install pods
cd ios && pod install && cd ..

# Android: No additional steps needed
```

### Running

```bash
# Start Metro bundler
pnpm start

# iOS (in another terminal)
pnpm ios

# Android (in another terminal)
pnpm android
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Session creation/joining
│   │   └── SessionScreen.tsx   # Main training screen
│   ├── components/
│   │   ├── YouTubePlayer.tsx   # YouTube IFrame wrapper
│   │   ├── HRDisplay.tsx       # Heart rate display
│   │   └── ZoneIndicator.tsx   # Zone color indicator
│   ├── services/
│   │   ├── api.ts              # REST API client
│   │   └── socket.ts           # WebSocket client
│   ├── hooks/
│   │   └── useSocket.ts        # WebSocket React hook
│   └── types/
│       └── index.ts            # TypeScript types
├── ios/                         # iOS native code
├── android/                     # Android native code
├── App.tsx                      # Root component
└── index.js                     # Entry point
```

## Configuration

### Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env`:
```env
API_URL=http://localhost:8080
WS_URL=http://localhost:8080
FEATURE_AUDIO_ONLY_MOBILE=false
DEFAULT_SESSION_ID=demo-session
DEFAULT_VIDEO_ID=dQw4w9WgXcQ
```

For iOS development, use your local IP:
```env
API_URL=http://192.168.1.100:8080
```

### Feature Flags

**FEATURE_AUDIO_ONLY_MOBILE**
- Default: `false` (enforced in production)
- Must remain `false` for YouTube ToS compliance
- Only set to `true` for internal testing (non-production builds)

## YouTube ToS Compliance

This app is **fully compliant** with YouTube's Terms of Service:

✅ **Video Always Visible**
- YouTube player is always visible when playing
- No audio-only mode in production builds
- No background playback

✅ **Configuration**
- iOS: `UISupportsBackgroundYouTubePlayback=false` in Info.plist
- Android: `FEATURE_AUDIO_ONLY_MOBILE=false` in AndroidManifest.xml
- Feature flag enforced at build time

✅ **CI Checks**
- Automated compliance checks in CI pipeline
- Builds fail if ToS violations detected

## Building for Production

### iOS

```bash
cd ios
xcodebuild -workspace ClaudeSportDemo.xcworkspace \
  -scheme ClaudeSportDemo \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  archive \
  -archivePath ClaudeSportDemo.xcarchive

# Create IPA
xcodebuild -exportArchive \
  -archivePath ClaudeSportDemo.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist exportOptions.plist
```

### Android

```bash
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Code Signing

**iOS**: Configure signing in Xcode
- Team: Select your development team
- Bundle Identifier: `com.claude.sportdemo`

**Android**: Generate keystore
```bash
keytool -genkeypair -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

## Testing

### Manual Testing

1. Start backend services:
```bash
# From repo root
docker compose up -d
```

2. Start mobile app:
```bash
cd apps/mobile
pnpm start
pnpm ios  # or pnpm android
```

3. Test scenarios:
- Create session → Verify video loads
- Join session → Verify sync with web client
- Play/Pause → Check sync across clients
- Start HR simulator → Verify HR display updates

### Automated Testing

```bash
# Unit tests (when implemented)
pnpm test

# E2E tests with Detox (planned)
pnpm e2e
```

## Troubleshooting

### iOS

**Metro bundler not found**
```bash
pnpm start -- --reset-cache
```

**Pod install fails**
```bash
cd ios
pod deintegrate
rm Podfile.lock
pod install
```

**Build fails with code signing**
- Open `ios/ClaudeSportDemo.xcworkspace` in Xcode
- Select signing team in project settings

### Android

**Gradle build fails**
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

**Metro connection refused**
```bash
adb reverse tcp:8081 tcp:8081
```

**WebSocket connection fails**
```bash
# Use local IP instead of localhost
API_URL=http://192.168.1.100:8080
```

### Common Issues

**EADDRINUSE: Metro port in use**
```bash
lsof -ti:8081 | xargs kill -9
```

**YouTube player not loading**
- Check internet connection
- Verify video ID is valid
- Check CORS settings in API

**WebSocket not connecting**
- Verify backend is running
- Check API_URL in .env
- For iOS simulator, use http://localhost
- For Android emulator, use http://10.0.2.2
- For physical device, use local IP

## Performance Optimization

### Bundle Size
- Hermes enabled for both platforms
- ProGuard enabled for Android release
- Code splitting with dynamic imports (planned)

### Network
- WebSocket reconnection with exponential backoff
- API request caching (planned)
- Optimistic UI updates

### Rendering
- React Native Reanimated for smooth animations
- Memoization of expensive computations
- FlatList for long cue lists

## Roadmap

### v0.2.0 (Next)
- [ ] Offline mode with cached sessions
- [ ] Push notifications for session invites
- [ ] User authentication
- [ ] Profile management (age, HR max)
- [ ] Watch app integration (watchOS/Wear OS)

### v0.3.0
- [ ] Video quality selection
- [ ] Playback speed control
- [ ] Session recording and playback
- [ ] Social features (friends, leaderboards)

### v0.4.0
- [ ] Custom workout builder
- [ ] Advanced HR analytics
- [ ] Training plans
- [ ] Coach mode

## Contributing

1. Create feature branch from `main`
2. Follow React Native best practices
3. Write TypeScript types for all data
4. Test on both iOS and Android
5. Update documentation
6. Submit pull request

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)

## License

MIT

---

**Built with ❤️ for synchronized fitness training**
