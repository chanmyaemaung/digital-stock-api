import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Role } from '@app/core/domain/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Subscription } from './subscription.entity';
import { Wallet } from './wallet.entity';
import { Notification } from './notification.entity';

@Entity('users')
export class User {
  @ApiProperty({
    example: 'uuid',
    description: 'The unique identifier of the user',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @Column()
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email of the user',
  })
  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column()
  ipAddress: string;

  @Column('jsonb')
  deviceInfo: any;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  // Audit fields
  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Subscription, (subscription) => subscription.user, {
    eager: true, // This will automatically load subscriptions
    nullable: true,
  })
  subscriptions: Subscription[];

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // Helper method to get active subscription
  get subscription(): Subscription | null {
    if (!this.subscriptions || this.subscriptions.length === 0) {
      return null;
    }
    // Return the most recent active subscription
    return this.subscriptions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];
  }

  // Domain methods
  public updateRole(newRole: Role): void {
    this.role = newRole;
    this.updatedAt = new Date();
  }

  public updatePassword(newPassword: string): void {
    this.password = newPassword;
    this.updatedAt = new Date();
  }
}
