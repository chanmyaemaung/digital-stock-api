import { Role } from '@app/core/domain/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Notification } from './notification.entity';
import { Subscription } from './subscription.entity';
import { Wallet } from './wallet.entity';

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

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column('jsonb', { name: 'device_info', nullable: true })
  deviceInfo: Record<string, any>;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
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
  }

  public updatePassword(newPassword: string): void {
    this.password = newPassword;
  }

  public updateDeviceInfo(deviceInfo: Record<string, any>): void {
    this.deviceInfo = deviceInfo;
    this.lastLoginAt = new Date();
  }
}
