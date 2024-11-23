import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { User } from './user.entity';
import { NotificationType } from '../enums/notification-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notifications')
export class Notification {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the notification',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who owns this notification',
  })
  @Column()
  userId: string;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.PAYMENT_SUCCESS,
    description: 'The type of notification',
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @ApiProperty({
    example: 'Payment Successful',
    description: 'The title of the notification',
  })
  @Column()
  title: string;

  @ApiProperty({
    example: 'Your payment of $10 has been processed successfully',
    description: 'The message content of the notification',
  })
  @Column()
  message: string;

  @ApiProperty({
    example: false,
    description: 'Whether the notification has been read',
  })
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty({
    example: { amount: 10, paymentId: '123' },
    description: 'Additional metadata for the notification',
    required: false,
  })
  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Notification creation timestamp',
  })
  @Column()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Notification last update timestamp',
  })
  @Column()
  updatedAt: Date;

  // Domain methods
  public markAsRead(): void {
    this.isRead = true;
    this.updatedAt = new Date();
  }
}
