import { Subscription } from '@app/core/domain/entities/subscription.entity';
import { SubscriptionStatus } from '@app/core/domain/enums/subscription-status.enum';
import { ISubscriptionRepository } from '@app/core/interfaces/repositories/subscription.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';

@Injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(
    @InjectRepository(Subscription)
    private readonly repository: Repository<Subscription>,
  ) {}

  async findById(id: string): Promise<Subscription | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'plan'],
    });
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    return this.repository.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByUser(userId: string): Promise<Subscription | null> {
    return this.repository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(new Date()),
      },
      relations: ['plan'],
    });
  }

  async findByStatus(status: SubscriptionStatus): Promise<Subscription[]> {
    return this.repository.find({
      where: { status },
      relations: ['user', 'plan'],
    });
  }

  async findExpiringSubscriptions(days: number): Promise<Subscription[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return this.repository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(expiryDate),
      },
      relations: ['user', 'plan'],
    });
  }

  async findExpired(): Promise<Subscription[]> {
    return this.repository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(new Date()),
      },
      relations: ['user', 'plan'],
    });
  }

  async create(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.repository.create(subscriptionData);
    return this.repository.save(subscription);
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async updateStatus(
    id: string,
    status: SubscriptionStatus,
  ): Promise<Subscription> {
    await this.repository.update(id, { status });
    return this.findById(id);
  }

  async countByStatus(status: SubscriptionStatus): Promise<number> {
    return this.repository.count({
      where: { status },
    });
  }
}
