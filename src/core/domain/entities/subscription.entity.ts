import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Plan } from './plan.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

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

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  // Domain methods
  public expire(): void {
    this.status = SubscriptionStatus.EXPIRED;
    this.updatedAt = new Date();
  }

  public isActive(): boolean {
    return (
      this.status === SubscriptionStatus.ACTIVE &&
      this.endDate.getTime() > new Date().getTime()
    );
  }

  public isExpiringSoon(daysThreshold: number = 3): boolean {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + daysThreshold);

    return (
      this.status === SubscriptionStatus.ACTIVE &&
      this.endDate.getTime() <= thresholdDate.getTime() &&
      this.endDate.getTime() > now.getTime()
    );
  }

  public updateRequestLimit(newLimit: number): void {
    if (this.plan) {
      this.plan.updateRequestLimit(newLimit);
      this.updatedAt = new Date();
    }
  }
}
