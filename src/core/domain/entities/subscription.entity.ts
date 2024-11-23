import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { Plan } from './plan.entity';
import { User } from './user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  @Column()
  planId: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  dailyRequestCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  public isActive(): boolean {
    return (
      this.status === SubscriptionStatus.ACTIVE && this.endDate > new Date()
    );
  }

  public isExpired(): boolean {
    return this.endDate <= new Date();
  }

  public isTrialPeriod(): boolean {
    const trialDays = 3;
    const trialEndDate = new Date(this.startDate);
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);
    return new Date() <= trialEndDate;
  }

  public expire(): void {
    this.status = SubscriptionStatus.EXPIRED;
    this.updatedAt = new Date();
  }

  public cancel(): void {
    this.status = SubscriptionStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  public updateRequestLimit(newLimit: number): void {
    if (this.metadata) {
      this.metadata.requestLimit = newLimit;
    } else {
      this.metadata = { requestLimit: newLimit };
    }
    this.updatedAt = new Date();
  }

  public incrementDailyRequestCount(): void {
    this.dailyRequestCount += 1;
    this.updatedAt = new Date();
  }

  public resetDailyRequestCount(): void {
    this.dailyRequestCount = 0;
    this.updatedAt = new Date();
  }
}
