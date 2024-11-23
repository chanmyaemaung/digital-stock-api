import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
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

  @Column()
  userId: string;

  @ApiProperty({ example: 100.5, description: 'Current balance in the wallet' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  // Domain methods
  public credit(amount: number): void {
    this.balance += amount;
    this.updatedAt = new Date();
  }

  public debit(amount: number): boolean {
    if (this.balance < amount) {
      return false;
    }
    this.balance -= amount;
    this.updatedAt = new Date();
    return true;
  }

  public hasEnoughBalance(amount: number): boolean {
    return this.balance >= amount;
  }
}
