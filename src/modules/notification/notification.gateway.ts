import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Notification } from '@app/core/domain/entities/notification.entity';

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

  private userSockets: Map<string, string[]> = new Map();

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const userSockets = this.userSockets.get(userId) || [];
      userSockets.push(client.id);
      this.userSockets.set(userId, userSockets);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const userSockets = this.userSockets.get(userId) || [];
      const updatedSockets = userSockets.filter(
        (socketId) => socketId !== client.id,
      );
      if (updatedSockets.length > 0) {
        this.userSockets.set(userId, updatedSockets);
      } else {
        this.userSockets.delete(userId);
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @OnEvent('notification.created')
  handleNotificationCreated(notification: Notification) {
    const userSockets = this.userSockets.get(notification.userId);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
      });
    }
  }
}
