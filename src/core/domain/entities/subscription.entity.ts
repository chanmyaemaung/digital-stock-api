import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { User } from './user.entity';
import type { Plan } from './plan.entity';
import { SubscriptionStatus } from '@app/core/domain/enums/subscription-status.enum';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne('Plan')
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  @Column()
  planId: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ default: 0 })
  dailyRequestCount: number;

  @Column()
  lastRequestReset: Date;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  // Domain methods
  public incrementRequestCount(): boolean {
    this.resetDailyCountIfNeeded();
    if (this.dailyRequestCount >= this.plan.requestLimit) {
      return false;
    }
    this.dailyRequestCount++;
    this.updatedAt = new Date();
    return true;
  }

  private resetDailyCountIfNeeded(): void {
    const today = new Date();
    if (this.lastRequestReset.getDate() !== today.getDate()) {
      this.dailyRequestCount = 0;
      this.lastRequestReset = today;
    }
  }

  public isActive(): boolean {
    return (
      this.status === SubscriptionStatus.ACTIVE && this.endDate > new Date()
    );
  }

  public expire(): void {
    this.status = SubscriptionStatus.EXPIRED;
    this.updatedAt = new Date();
  }

  public updateRequestLimit(newLimit: number): void {
    if (this.plan) {
      this.plan.requestLimit = newLimit;
      this.updatedAt = new Date();
    }
  }
}
