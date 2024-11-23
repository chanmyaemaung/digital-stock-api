import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { NotificationType } from '../enums/notification-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notifications')
export class Notification {
  @ApiProperty({
    example: 'uuid',
    description: 'Unique identifier for the notification',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.WALLET_CREDITED,
    description: 'Type of notification',
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @ApiProperty({
    example: 'Wallet Credited',
    description: 'Notification title',
  })
  @Column()
  title: string;

  @ApiProperty({
    example: 'Your wallet has been credited with $100',
    description: 'Notification message',
  })
  @Column()
  message: string;

  @ApiProperty({ example: false, description: 'Read status' })
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty({
    example: { amount: 100, currency: 'USD' },
    description: 'Additional notification metadata',
  })
  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column()
  createdAt: Date;

  // Domain methods
  public markAsRead(): void {
    this.isRead = true;
  }
}
