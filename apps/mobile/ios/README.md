# iOS Setup

## Prerequisites
- Xcode 14+
- CocoaPods
- Ruby (for CocoaPods)

## Installation

```bash
cd apps/mobile
pnpm install
cd ios
pod install
cd ..
```

## Running

```bash
# From apps/mobile directory
pnpm ios

# Or with specific device
pnpm ios -- --simulator="iPhone 15 Pro"
```

## Building for Release

```bash
cd ios
xcodebuild -workspace ClaudeSportDemo.xcworkspace \
  -scheme ClaudeSportDemo \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  archive
```

## YouTube ToS Compliance

This iOS app is configured to display YouTube videos in a visible player:
- ✅ Video playback is always visible
- ✅ No background audio playback for YouTube content
- ✅ UISupportsBackgroundYouTubePlayback is explicitly set to false
- ✅ Feature flag FEATURE_AUDIO_ONLY_MOBILE=false enforced

## Troubleshooting

### Pod Install Fails
```bash
cd ios
pod deintegrate
pod install --repo-update
```

### Build Fails
- Clean build folder: Xcode → Product → Clean Build Folder
- Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
