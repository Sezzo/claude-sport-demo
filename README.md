# Claude Sport Demo - Synchronized YouTube Training with Heart Rate Zones

Autonomous setup for synchronized YouTube training sessions with real-time heart rate zone coaching.

## Overview

This monorepo contains a complete MVP for synchronized video training with:
- **Web App**: Next.js with YouTube IFrame API for synchronized video playback
- **Mobile App**: React Native (iOS/Android) with YouTube SDK integration
- **Watch Apps**: Placeholders for watchOS and Wear OS (HR monitoring)
- **Backend API**: NestJS with REST endpoints and WebSocket gateway for real-time sync
- **Heart Rate Simulator**: Tool for testing HR zone coaching without real devices
- **COLOUR CODE Parser**: Extracts training zones from YouTube video descriptions
- **Docker Compose**: Full local development environment with PostgreSQL and Redis

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+
- pnpm 9+

### Setup

```bash
# 1. Copy environment variables
cp .env.example .env

# 2. Install dependencies
pnpm install

# 3. Start services (db, redis, api, web)
docker compose up -d --build

# 4. Run migrations (in another terminal)
pnpm db:migrate

# 5. (Optional) Seed database
pnpm --filter @svc/api seed
```

### Verify Installation

- **Web UI**: http://localhost:3000
- **API**: http://localhost:8080
- **Database**: localhost:5432 (postgres/postgres)
- **Redis**: localhost:6379

### Development Commands

```bash
# Start all services in development mode
pnpm dev

# Run tests
pnpm test

# Run E2E tests
pnpm e2e

# View logs
make logs

# Stop all services
make down

# Start HR simulator
make hr-sim
```

## Architecture

### Monorepo Structure

```
.
├── apps/
│   ├── web/              # Next.js web application
│   ├── mobile/           # React Native app (iOS/Android)
│   ├── watch-ios/        # watchOS companion (placeholder)
│   └── watch-android/    # Wear OS companion (placeholder)
├── services/
│   └── api/              # NestJS backend (REST + WebSocket)
├── libs/
│   ├── shared-types/     # Shared TypeScript types
│   └── clients/          # Generated API clients
├── specs/
│   ├── openapi.yaml      # REST API specification
│   └── asyncapi.yaml     # WebSocket API specification
├── tools/
│   ├── hr-sim/           # Heart rate simulator
│   ├── yt-desc-samples/  # Sample YouTube descriptions
│   └── agent/            # Agent task definitions
├── prisma/               # Database schema and migrations
└── e2e/                  # End-to-end tests
```

### Tech Stack

- **Package Manager**: pnpm with workspaces
- **Build System**: Turborepo
- **Backend**: NestJS, Prisma, PostgreSQL, Redis, Socket.IO
- **Web**: Next.js 14, React 18, Socket.IO Client
- **Mobile**: React Native 0.76 (Bare), YouTube IFrame, Socket.IO Client
- **Watch**: watchOS (Swift/HealthKit), Wear OS (Kotlin/Health Services) - Placeholders
- **Testing**: Jest, Playwright, Detox (planned)
- **DevOps**: Docker Compose, GitHub Actions

## Features

### 1. Synchronized Video Playback

Multiple clients can join a session and have synchronized Play/Pause/Seek controls via WebSocket.

**REST Endpoints**:
- `POST /sessions` - Create a new training session
- `POST /sessions/{id}/join` - Join a session
- `GET /sessions/{id}` - Get session details
- `GET /sessions/{id}/cues` - Get training zone cues

**WebSocket Events**:
- `session.join` - Join a session room
- `player.control` - Broadcast play/pause/seek commands
- `hr.update` - Receive heart rate updates

### 2. COLOUR CODE Parser

Parses YouTube video descriptions to extract training zone segments:

**Color Codes**:
- ⚪ White (Recovery) - 0-50% max HR
- ⚫️ Grey (Easy) - 50-59% max HR
- 🔵 Blue (Aerobic) - 60-69% max HR
- 🟢 Green (Tempo) - 70-79% max HR
- 🟡 Yellow (Threshold) - 80-89% max HR
- 🔴 Red (VO2 Max) - 90-100% max HR

**Example**:
```bash
curl -X POST http://localhost:8080/parser/youtube \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "dQw4w9WgXcQ",
    "description": "0:00 ⚪ White Warm-up\n5:00 🔵 Blue Easy pace\n10:00 🟢 Green Tempo",
    "duration": 1800
  }'
```

### 3. Heart Rate Simulation

Test HR zone coaching without real devices:

```bash
cd tools/hr-sim
pnpm install
SESSION_ID=demo-session pnpm start
```

The simulator sends realistic HR data every second with a training profile:
- 0-5 min: Warmup (100-140 BPM)
- 5-15 min: Intervals (140-170 BPM)
- 15+ min: Recovery (120 BPM)

### 4. Mobile App (iOS/Android)

Native mobile experience with synchronized playback:

**Features**:
- YouTube video player (visible, ToS-compliant)
- Session creation and joining
- Real-time sync with other participants
- Heart rate display with zone indicators
- Training timeline with cue navigation

**Running**:
```bash
cd apps/mobile
pnpm install

# iOS
cd ios && pod install && cd ..
pnpm ios

# Android
pnpm android
```

**Platforms**:
- iOS 13+ (iPhone, iPad)
- Android API 24+ (phones, tablets)

See [apps/mobile/README.md](apps/mobile/README.md) for detailed setup.

## YouTube ToS Compliance

**CRITICAL**: This application complies with YouTube's Terms of Service.

### Production Builds
- ✅ Video player is **always visible** on web and mobile
- ✅ No audio-only playback in production
- ✅ No background playback of YouTube content
- ✅ Feature flag `FEATURE_AUDIO_ONLY_MOBILE=false` by default

### Development/Testing Only
- Audio-only mode is available **only** behind feature flag for internal testing
- Never enable in production builds submitted to app stores

### CI Compliance Check
Every build checks that `FEATURE_AUDIO_ONLY_MOBILE=false` in production configurations.

## Database Schema

**Models**:
- `User` - User accounts with HR max and birth year
- `Device` - Connected wearable devices (watches, heart rate monitors)
- `Session` - Training sessions linked to YouTube videos
- `SessionMember` - Participants in a session
- `VideoCue` - Parsed training zone segments

**Migrations**:
```bash
# Create a new migration
pnpm --filter @svc/api prisma migrate dev --name <name>

# Apply migrations
pnpm db:migrate

# Reset database (DEV ONLY)
pnpm db:reset
```

## Testing

### Unit Tests
```bash
pnpm test
```

Tests include:
- Parser logic (color code recognition, time parsing)
- WebSocket event handlers
- API endpoints

### E2E Tests
```bash
pnpm e2e
```

E2E scenarios:
- Multi-client synchronization (smoke test)
- Parser with sample descriptions
- HR simulator integration

### Manual Testing

1. **Start services**: `docker compose up -d`
2. **Open two browser windows** to http://localhost:3000
3. **Click Play in window 1** → should sync to window 2
4. **Start HR simulator**: `make hr-sim` → HR data appears in UI

## CI/CD

### GitHub Actions Workflows

1. **CI** (`.github/workflows/ci.yml`)
   - Runs on push/PR
   - Install, migrate, build, test
   - Feature flag compliance check

2. **CD Staging** (`.github/workflows/cd_staging.yml`)
   - Deploys to staging after successful CI
   - (Placeholder for deployment scripts)

3. **Agent Guardrails** (`.github/workflows/agent_guardrails.yml`)
   - Additional checks on PRs
   - YouTube ToS compliance validation

## Agent Tasks

Agent-executable task definitions in `tools/agent/tasks/*.yaml`:

```bash
# Run bootstrap task
make agent

# Or directly
bash tools/agent/run_agent.sh bootstrap
```

## API Documentation

- **OpenAPI Spec**: `specs/openapi.yaml`
- **AsyncAPI Spec**: `specs/asyncapi.yaml`

Generate clients:
```bash
pnpm codegen
```

## Troubleshooting

### Port Conflicts
If ports 3000, 5432, 6379, or 8080 are in use:
```bash
# Stop services
make down

# Check what's using the port
lsof -i :3000
```

### Database Connection Issues
```bash
# Check database is running
docker compose ps

# View database logs
docker compose logs db

# Reset database
make down && make up
```

### Prisma Issues
```bash
# Regenerate Prisma client
pnpm --filter @svc/api prisma generate

# Push schema without migration
pnpm --filter @svc/api prisma db push
```

## Roadmap

### Completed ✅
- Monorepo bootstrap with pnpm + Turborepo
- NestJS API with REST and WebSocket
- Next.js web app with YouTube IFrame
- Prisma schema and migrations
- HR simulator tool
- COLOUR CODE parser
- Docker Compose setup
- CI/CD pipelines
- E2E test framework

### Next Steps 📋
1. **Drift Control**: Implement precise time-drift correction in web client
2. **Mobile App**: React Native app with YouTube SDK integration
3. **Real HR Integration**: Apple Watch and Wear OS bridges
4. **Advanced Parser**: Support more description formats
5. **Session Reports**: Post-workout summaries with HR zone time
6. **User Authentication**: JWT-based auth system

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test: `pnpm test && pnpm e2e`
3. Commit: `git commit -m "feat: add feature"`
4. Push: `git push origin feature/my-feature`
5. Create Pull Request

## License

MIT

## Support

- **Issues**: Report bugs and feature requests on GitHub Issues
- **Docs**: See `dev.prd` for full product requirements
- **Contact**: [Your contact information]

---

**Built with ❤️ for synchronized fitness training**
