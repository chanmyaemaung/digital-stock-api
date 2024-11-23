import { Injectable, Inject } from '@nestjs/common';
import { ITransactionRepository } from '@app/core/interfaces/repositories/transaction.repository.interface';
import { TransactionType } from '@app/core/domain/enums/transaction-type.enum';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async getTransactionsByType(walletId: string, type: TransactionType) {
    return this.transactionRepository.findByType(walletId, type);
  }

  async getLatestTransactions(walletId: string, limit?: number) {
    return this.transactionRepository.getLatestTransactions(walletId, limit);
  }

  async getTransactionDetails(transactionId: string) {
    return this.transactionRepository.findById(transactionId);
  }
}
