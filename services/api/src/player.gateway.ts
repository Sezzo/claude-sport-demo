import { WebSocketGateway, OnGatewayConnection, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class PlayerGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

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
}
