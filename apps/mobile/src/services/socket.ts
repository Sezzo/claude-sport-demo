import {io, Socket} from 'socket.io-client';
import Config from 'react-native-config';
import type {PlayerControlEvent, HRUpdateEvent} from '../types';

const WS_URL = Config.WS_URL || 'http://localhost:8080';

export class SocketService {
  private socket: Socket | null = null;
  private sessionId: string | null = null;
  private userId: string;

  constructor(userId: string = 'mobile-user') {
    this.userId = userId;
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      if (this.sessionId) {
        this.joinSession(this.sessionId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinSession(sessionId: string): void {
    this.sessionId = sessionId;
    if (this.socket?.connected) {
      this.socket.emit('session.join', {
        sessionId,
        userId: this.userId,
      });
    }
  }

  sendPlayerControl(event: PlayerControlEvent): void {
    if (this.socket?.connected) {
      this.socket.emit('player.control', event);
    }
  }

  sendHRUpdate(event: HRUpdateEvent): void {
    if (this.socket?.connected) {
      this.socket.emit('hr.update', event);
    }
  }

  onPlayerControl(callback: (event: PlayerControlEvent) => void): void {
    this.socket?.on('player.control', callback);
  }

  onHRUpdate(callback: (event: HRUpdateEvent) => void): void {
    this.socket?.on('hr.update', callback);
  }

  offPlayerControl(callback: (event: PlayerControlEvent) => void): void {
    this.socket?.off('player.control', callback);
  }

  offHRUpdate(callback: (event: HRUpdateEvent) => void): void {
    this.socket?.off('hr.update', callback);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new SocketService();
