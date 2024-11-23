import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  stripePaymentId?: string;

  @Column({ nullable: true })
  stripeSessionId?: string;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  // Domain methods
  public markAsCompleted(): void {
    this.status = PaymentStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  public markAsFailed(): void {
    this.status = PaymentStatus.FAILED;
    this.updatedAt = new Date();
  }

  public approve(): void {
    this.status = PaymentStatus.COMPLETED;
    this.updatedAt = new Date();
  }
}
