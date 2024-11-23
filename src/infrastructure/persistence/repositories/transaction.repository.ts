import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '@app/core/domain/entities/transaction.entity';
import { TransactionType } from '@app/core/domain/enums/transaction-type.enum';
import { ITransactionRepository } from '@app/core/interfaces/repositories/transaction.repository.interface';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['wallet'],
    });
  }

  async findByWallet(walletId: string, limit?: number): Promise<Transaction[]> {
    const query = this.repository
      .createQueryBuilder('transaction')
      .where('transaction.walletId = :walletId', { walletId })
      .orderBy('transaction.createdAt', 'DESC');

    if (limit) {
      query.take(limit);
    }

    return query.getMany();
  }

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.repository.create({
      ...transactionData,
      createdAt: new Date(),
    });
    return this.repository.save(transaction);
  }

  async createMany(
    transactions: Partial<Transaction>[],
  ): Promise<Transaction[]> {
    const createdTransactions = transactions.map((transaction) =>
      this.repository.create({
        ...transaction,
        createdAt: new Date(),
      }),
    );
    return this.repository.save(createdTransactions);
  }

  async findByType(
    walletId: string,
    type: TransactionType,
  ): Promise<Transaction[]> {
    return this.repository.find({
      where: {
        walletId,
        type,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getLatestTransactions(
    walletId: string,
    limit: number = 10,
  ): Promise<Transaction[]> {
    return this.repository.find({
      where: { walletId },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }
}
