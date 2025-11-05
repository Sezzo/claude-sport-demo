// WebSocket Client
// This will be enhanced with generated types from AsyncAPI

import type {
  PlayerControlEvent,
  HRUpdateEvent,
  SessionJoinEvent,
} from '@libs/shared-types';

export interface SocketClientOptions {
  url?: string;
  reconnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export class SocketClient {
  private url: string;
  private socket: any; // Will be Socket.IO instance
  private options: Required<SocketClientOptions>;

  constructor(options: SocketClientOptions = {}) {
    this.url = options.url || 'http://localhost:8080';
    this.options = {
      url: this.url,
      reconnect: options.reconnect ?? true,
      reconnectionAttempts: options.reconnectionAttempts ?? 5,
      reconnectionDelay: options.reconnectionDelay ?? 1000,
    };
  }

  connect(): Promise<void> {
    // Implementation will use socket.io-client
    // This is a placeholder for generated client
    return Promise.resolve();
  }

  disconnect(): void {
    // Implementation placeholder
  }

  joinSession(event: SessionJoinEvent): void {
    this.emit('session.join', event);
  }

  sendPlayerControl(event: PlayerControlEvent): void {
    this.emit('player.control', event);
  }

  sendHRUpdate(event: HRUpdateEvent): void {
    this.emit('hr.update', event);
  }

  onPlayerControl(callback: (event: PlayerControlEvent) => void): () => void {
    return this.on('player.control', callback);
  }

  onHRUpdate(callback: (event: HRUpdateEvent) => void): () => void {
    return this.on('hr.update', callback);
  }

  private emit(event: string, data: any): void {
    // Placeholder
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  private on(event: string, callback: (data: any) => void): () => void {
    // Placeholder
    if (this.socket) {
      this.socket.on(event, callback);
      return () => this.socket.off(event, callback);
    }
    return () => {};
  }
}
