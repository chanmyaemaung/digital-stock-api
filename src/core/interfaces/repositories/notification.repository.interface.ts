import { Notification } from '@app/core/domain/entities/notification.entity';
import { NotificationType } from '@app/core/domain/enums/notification-type.enum';

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByUser(userId: string, limit?: number): Promise<Notification[]>;
  findUnreadByUser(userId: string): Promise<Notification[]>;
  create(notification: Partial<Notification>): Promise<Notification>;
  update(id: string, data: Partial<Notification>): Promise<Notification>;
  markAsRead(id: string): Promise<Notification>;
  findByType(type: NotificationType): Promise<Notification[]>;
}
