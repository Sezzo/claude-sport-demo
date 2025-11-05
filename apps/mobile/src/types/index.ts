export interface Session {
  id: string;
  youtubeVideoId: string;
  title?: string;
  status: string;
  hostUserId: string;
  createdAt: string;
}

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

export interface VideoCue {
  id: string;
  youtubeVideoId: string;
  segmentIndex: number;
  startS: number;
  endS: number;
  zoneCode: string;
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
