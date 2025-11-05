# API Clients

Generated TypeScript clients from OpenAPI and AsyncAPI specifications.

## Usage

### REST Client

```typescript
import { RestClient } from '@libs/clients';

const client = new RestClient('http://localhost:8080');

// Create session
const session = await client.createSession({
  youtubeVideoId: 'dQw4w9WgXcQ',
  title: 'Morning Workout',
});

// Get session
const sessionData = await client.getSession(session.id);

// Join session
await client.joinSession(session.id, 'user-123');

// Get cues
const cues = await client.getSessionCues(session.id);

// Parse YouTube description
const parsed = await client.parseYouTube({
  videoId: 'dQw4w9WgXcQ',
  description: '0:00 ⚪ Warm-up\n5:00 🔵 Easy pace',
  duration: 1800,
});
```

### WebSocket Client

```typescript
import { SocketClient } from '@libs/clients';

const socket = new SocketClient({
  url: 'http://localhost:8080',
  reconnect: true,
});

await socket.connect();

// Join session
socket.joinSession({
  sessionId: 'session-123',
  userId: 'user-456',
});

// Send player control
socket.sendPlayerControl({
  sessionId: 'session-123',
  action: 'play',
  issuedAt: Date.now() / 1000,
});

// Listen for player control events
const unsubscribe = socket.onPlayerControl((event) => {
  console.log('Player control:', event.action);
});

// Send HR update
socket.sendHRUpdate({
  sessionId: 'session-123',
  userId: 'user-456',
  bpm: 145,
  t: Date.now() / 1000,
  device: 'Apple Watch',
});

// Listen for HR updates
socket.onHRUpdate((event) => {
  console.log('HR Update:', event.bpm, 'BPM');
});
```

## Code Generation

Run codegen to generate types from specs:

```bash
pnpm codegen
```

This will generate:
- `src/openapi.ts` - OpenAPI types
- AsyncAPI client (future)

## OpenAPI Types

After running codegen, use the generated types:

```typescript
import type { paths, components } from '@libs/clients/openapi';

type CreateSessionRequest = paths['/sessions']['post']['requestBody']['content']['application/json'];
type CreateSessionResponse = paths['/sessions']['post']['responses']['200']['content']['application/json'];
```

## Development

```bash
# Generate types
pnpm codegen

# Build
pnpm build

# Watch mode
pnpm dev
```
