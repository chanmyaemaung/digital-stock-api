import { Subscription } from '@app/core/domain/entities/subscription.entity';
import { SubscriptionStatus } from '@app/core/domain/enums/subscription-status.enum';

export interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByUser(userId: string): Promise<Subscription[]>;
  findActiveByUser(userId: string): Promise<Subscription | null>;
  findByStatus(status: SubscriptionStatus): Promise<Subscription[]>;
  findExpiringSubscriptions(days: number): Promise<Subscription[]>;
  findExpired(): Promise<Subscription[]>;
  create(subscription: Partial<Subscription>): Promise<Subscription>;
  update(id: string, data: Partial<Subscription>): Promise<Subscription>;
  updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription>;
}
