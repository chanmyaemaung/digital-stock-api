import { Notification } from '@app/core/domain/entities/notification.entity';

export interface INotificationRepository {
  create(data: Partial<Notification>): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUser(userId: string, limit?: number): Promise<Notification[]>;
  findUnreadByUser(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
  update(id: string, data: Partial<Notification>): Promise<Notification>;
  delete(id: string): Promise<void>;
  deleteAllByUser(userId: string): Promise<void>;
}
