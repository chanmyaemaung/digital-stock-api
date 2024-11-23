import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@app/core/domain/entities/notification.entity';
import { INotificationRepository } from '@app/core/interfaces/repositories/notification.repository.interface';
import { NotificationType } from '@app/core/domain/enums/notification-type.enum';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async findById(id: string): Promise<Notification | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUser(userId: string, limit?: number): Promise<Notification[]> {
    const query = this.repository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .leftJoinAndSelect('notification.user', 'user');

    if (limit) {
      query.take(limit);
    }

    return query.getMany();
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { userId, isRead: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = this.repository.create(notificationData);
    return this.repository.save(notification);
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findById(id);
    if (notification) {
      notification.markAsRead();
      return this.repository.save(notification);
    }
    return null;
  }

  async findByType(type: NotificationType): Promise<Notification[]> {
    return this.repository.find({
      where: { type },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
