import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '@app/core/interfaces/repositories/notification.repository.interface';
import { NotificationType } from '@app/core/domain/enums/notification-type.enum';
import { NotificationGateway } from './notification.gateway';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationGateway: NotificationGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ) {
    const notification = await this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      metadata,
      isRead: false,
      createdAt: new Date(),
    });

    // Emit event for real-time notifications
    this.eventEmitter.emit('notification.created', notification);

    // Send real-time notification via WebSocket
    this.notificationGateway.sendNotificationToUser(userId, notification);

    return notification;
  }

  async getUserNotifications(userId: string, limit?: number) {
    return this.notificationRepository.findByUser(userId, limit);
  }

  async getUnreadNotifications(userId: string) {
    return this.notificationRepository.findUnreadByUser(userId);
  }

  async markAsRead(id: string) {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    const unreadNotifications = await this.getUnreadNotifications(userId);
    const markAsReadPromises = unreadNotifications.map((notification) =>
      this.markAsRead(notification.id),
    );
    return Promise.all(markAsReadPromises);
  }

  async deleteNotification(id: string) {
    return this.notificationRepository.delete(id);
  }

  async deleteAllByUser(userId: string) {
    return this.notificationRepository.deleteAllByUser(userId);
  }
}
