import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@app/core/domain/entities/notification.entity';
import { INotificationRepository } from '@app/core/interfaces/repositories/notification.repository.interface';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = this.repository.create(data);
    return this.repository.save(notification);
  }

  async findById(id: string): Promise<Notification | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUser(userId: string, limit?: number): Promise<Notification[]> {
    const query = this.repository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (limit) {
      query.take(limit);
    }

    return query.getMany();
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.repository.find({
      where: {
        userId,
        isRead: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.markAsRead();
    return this.repository.save(notification);
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteAllByUser(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }
}
