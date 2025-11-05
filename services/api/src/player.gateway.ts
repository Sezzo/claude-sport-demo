import { WebSocketGateway, OnGatewayConnection, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class PlayerGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(PlayerGateway.name);

  handleConnection(client: Socket) {
    // noop; client should emit join with sessionId
  }

  @SubscribeMessage('session.join')
  onJoin(@MessageBody() payload: { sessionId: string; userId: string }, @ConnectedSocket() socket: Socket) {
    socket.join(payload.sessionId);
    socket.emit('session.state', { ok: true });
  }

  @SubscribeMessage('player.control')
  onControl(@MessageBody() payload: { sessionId: string; action: string; position?: number; videoId?: string; issuedAt?: number }) {
    // Broadcast to room
    this.server.to(payload.sessionId).emit('player.control', payload);
  }

  @SubscribeMessage('hr.update')
  onHr(@MessageBody() data: { sessionId: string; userId: string; bpm: number; t: number; device: string }) {
    // Forward to room (for coaching UIs). Persisting HR is optional here.
    this.server.to(data.sessionId).emit('hr.update', data);
  }

  @SubscribeMessage('zone.detect')
  onZoneDetect(@MessageBody() data: { sessionId: string; imageBase64: string }) {
    // Log detection request
    this.logger.log(`Zone detection via WebSocket for session ${data.sessionId}`);
    // Note: Actual ML processing should be done via HTTP endpoint for better error handling
    // This event is kept for backward compatibility if clients prefer WebSocket
  }

  /**
   * Broadcast zone update to all participants in a session
   * Called by ZoneDetectorController after ML analysis
   */
  broadcastZoneUpdate(
    sessionId: string,
    zoneData: {
      zoneCode: string;
      zoneName: string;
      confidence: number;
      timestamp: string;
    },
  ) {
    this.logger.log(`Broadcasting zone update to session ${sessionId}: ${zoneData.zoneCode} (${zoneData.zoneName})`);
    this.server.to(sessionId).emit('zone.update', zoneData);
  }
}
