import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('wallets')
export class Wallet {
  @ApiProperty({
    example: 'uuid',
    description: 'Unique identifier for the wallet',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ example: 'uuid', description: 'ID of the wallet owner' })
  @Column()
  userId: string;

  @ApiProperty({ example: 100.5, description: 'Current balance in the wallet' })
  @Column('decimal', { precision: 10, scale: 2 })
  balance: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Creation timestamp',
  })
  @Column()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Last update timestamp',
  })
  @Column()
  updatedAt: Date;

  // Domain methods
  public deductBalance(amount: number): boolean {
    if (this.balance < amount) {
      return false;
    }
    this.balance -= amount;
    this.updatedAt = new Date();
    return true;
  }

  public addBalance(amount: number): void {
    this.balance += amount;
    this.updatedAt = new Date();
  }
}
