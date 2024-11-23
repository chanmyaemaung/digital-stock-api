import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private userSockets = new Map<string, string[]>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const userSocketIds = this.userSockets.get(userId) || [];
      userSocketIds.push(client.id);
      this.userSockets.set(userId, userSocketIds);
      this.logger.log(`Client connected: ${client.id} for user: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const userSocketIds = this.userSockets.get(userId) || [];
      const updatedSocketIds = userSocketIds.filter((id) => id !== client.id);
      if (updatedSocketIds.length > 0) {
        this.userSockets.set(userId, updatedSocketIds);
      } else {
        this.userSockets.delete(userId);
      }
      this.logger.log(`Client disconnected: ${client.id} for user: ${userId}`);
    }
  }

  @OnEvent('notification.created')
  handleNotificationCreated(notification: any) {
    const userSocketIds = this.userSockets.get(notification.userId);
    if (userSocketIds) {
      userSocketIds.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
      });
    }
  }
}
