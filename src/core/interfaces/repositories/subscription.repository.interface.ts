import { Subscription } from '@app/core/domain/entities/subscription.entity';
import { SubscriptionStatus } from '@app/core/domain/enums/subscription-status.enum';

export interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByUser(userId: string): Promise<Subscription[]>;
  findActiveByUser(userId: string): Promise<Subscription | null>;
  create(subscription: Partial<Subscription>): Promise<Subscription>;
  update(id: string, data: Partial<Subscription>): Promise<Subscription>;
  updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription>;
  findExpiringSubscriptions(
    daysUntilExpiration: number,
  ): Promise<Subscription[]>;
}
