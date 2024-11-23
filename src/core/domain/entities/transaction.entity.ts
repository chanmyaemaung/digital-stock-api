import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('transactions')
export class Transaction {
  @ApiProperty({
    example: 'uuid',
    description: 'Unique identifier for the transaction',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column()
  walletId: string;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.CREDIT,
    description: 'Type of transaction',
  })
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @ApiProperty({ example: 50.0, description: 'Transaction amount' })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    example: 'Wallet top-up',
    description: 'Transaction description',
  })
  @Column()
  description: string;

  @ApiProperty({
    example: { paymentId: 'xxx', method: 'stripe' },
    description: 'Additional transaction metadata',
  })
  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column()
  createdAt: Date;
}
