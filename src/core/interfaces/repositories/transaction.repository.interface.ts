import { Transaction } from '@app/core/domain/entities/transaction.entity';
import { TransactionType } from '@app/core/domain/enums/transaction-type.enum';

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByWallet(walletId: string, limit?: number): Promise<Transaction[]>;
  create(transaction: Partial<Transaction>): Promise<Transaction>;
  createMany(transactions: Partial<Transaction>[]): Promise<Transaction[]>;
  findByType(walletId: string, type: TransactionType): Promise<Transaction[]>;
  getLatestTransactions(
    walletId: string,
    limit?: number,
  ): Promise<Transaction[]>;
}
