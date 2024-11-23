import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { Subscription } from '@app/core/domain/entities/subscription.entity';
import { ISubscriptionRepository } from '@app/core/interfaces/repositories/subscription.repository.interface';
import { SubscriptionStatus } from '@app/core/domain/enums/subscription-status.enum';

@Injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(
    @InjectRepository(Subscription)
    private readonly repository: Repository<Subscription>,
  ) {}

  async findById(id: string): Promise<Subscription | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['plan', 'user'],
    });
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    return this.repository.find({
      where: { userId },
      relations: ['plan'],
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

  async findExpiringSubscriptions(
    daysUntilExpiration: number,
  ): Promise<Subscription[]> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysUntilExpiration);

    return this.repository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThanOrEqual(expirationDate),
      },
      relations: ['user', 'plan'],
    });
  }
}
