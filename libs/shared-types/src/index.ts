// Shared TypeScript types for the monorepo

export interface User {
  id: string;
  email: string;
  displayName?: string;
  birthYear?: number;
  hrMax?: number;
  createdAt: Date;
}

export interface Device {
  id: string;
  userId: string;
  type: string;
  model?: string;
  bleIdentifier?: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  hostUserId: string;
  youtubeVideoId: string;
  title?: string;
  startAt?: Date;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface SessionMember {
  sessionId: string;
  userId: string;
  role: 'host' | 'participant';
  joinedAt: Date;
}

export interface VideoCue {
  id: string;
  youtubeVideoId: string;
  segmentIndex: number;
  startS: number;
  endS: number;
  zoneCode: ZoneCode;
  label?: string;
}

export type ZoneCode = 'white' | 'grey' | 'blue' | 'green' | 'yellow' | 'red';

export interface Zone {
  code: ZoneCode;
  name: string;
  emoji: string;
  color: string;
  minPercent: number;
  maxPercent: number;
}

export const ZONES: Record<ZoneCode, Zone> = {
  white: {
    code: 'white',
    name: 'Recovery',
    emoji: '⚪',
    color: '#FFFFFF',
    minPercent: 0,
    maxPercent: 50,
  },
  grey: {
    code: 'grey',
    name: 'Easy',
    emoji: '⚫️',
    color: '#808080',
    minPercent: 50,
    maxPercent: 59,
  },
  blue: {
    code: 'blue',
    name: 'Aerobic',
    emoji: '🔵',
    color: '#0000FF',
    minPercent: 60,
    maxPercent: 69,
  },
  green: {
    code: 'green',
    name: 'Tempo',
    emoji: '🟢',
    color: '#00FF00',
    minPercent: 70,
    maxPercent: 79,
  },
  yellow: {
    code: 'yellow',
    name: 'Threshold',
    emoji: '🟡',
    color: '#FFFF00',
    minPercent: 80,
    maxPercent: 89,
  },
  red: {
    code: 'red',
    name: 'VO2 Max',
    emoji: '🔴',
    color: '#FF0000',
    minPercent: 90,
    maxPercent: 100,
  },
};

// WebSocket Event Types
export interface PlayerControlEvent {
  sessionId: string;
  action: 'play' | 'pause' | 'seek' | 'load';
  position?: number;
  videoId?: string;
  issuedAt: number;
}

export interface HRUpdateEvent {
  sessionId: string;
  userId: string;
  bpm: number;
  t: number;
  device: string;
}

export interface SessionJoinEvent {
  sessionId: string;
  userId: string;
}

export interface SessionStateEvent {
  ok: boolean;
  error?: string;
}

// API Request/Response Types
export interface CreateSessionRequest {
  youtubeVideoId: string;
  title?: string;
  hostUserId?: string;
}

export interface CreateSessionResponse extends Session {}

export interface JoinSessionRequest {
  userId: string;
  role?: 'host' | 'participant';
}

export interface JoinSessionResponse {
  ok: boolean;
}

export interface ParseYouTubeRequest {
  videoId: string;
  description?: string;
  duration?: number;
}

export interface ParseYouTubeResponse {
  cues: VideoCue[];
  zones: Record<ZoneCode, [number, number]>;
}

// Utility Types
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export function calculateHRMax(age: number): number {
  return Math.round(211 - 0.64 * age);
}

export function calculateZoneRange(hrMax: number, zone: Zone): [number, number] {
  const min = Math.round((hrMax * zone.minPercent) / 100);
  const max = Math.round((hrMax * zone.maxPercent) / 100);
  return [min, max];
}

export function getZoneForBPM(bpm: number, hrMax: number): Zone {
  const percent = (bpm / hrMax) * 100;
  for (const zone of Object.values(ZONES)) {
    if (percent >= zone.minPercent && percent <= zone.maxPercent) {
      return zone;
    }
  }
  return ZONES.white;
}
