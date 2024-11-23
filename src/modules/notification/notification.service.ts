import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '@app/core/interfaces/repositories/notification.repository.interface';
import { NotificationType } from '@app/core/domain/enums/notification-type.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    private eventEmitter: EventEmitter2,
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
      updatedAt: new Date(),
    });

    // Emit event for real-time notifications
    this.eventEmitter.emit('notification.created', notification);

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

  // Utility methods for specific notification types
  async notifySubscriptionExpiring(userId: string, daysLeft: number) {
    return this.createNotification(
      userId,
      NotificationType.SUBSCRIPTION_EXPIRING,
      'Subscription Expiring Soon',
      `Your subscription will expire in ${daysLeft} days.`,
      { daysLeft },
    );
  }

  async notifyRequestLimitExceeded(
    userId: string,
    currentCount: number,
    limit: number,
  ) {
    return this.createNotification(
      userId,
      NotificationType.REQUEST_LIMIT_EXCEEDED,
      'Daily Request Limit Exceeded',
      `You've reached your daily request limit (${currentCount}/${limit}).`,
      { currentCount, limit },
    );
  }

  async notifyPaymentSuccess(userId: string, amount: number) {
    return this.createNotification(
      userId,
      NotificationType.PAYMENT_SUCCESSFUL,
      'Payment Successful',
      `Your payment of $${amount} has been processed successfully.`,
      { amount },
    );
  }
}
