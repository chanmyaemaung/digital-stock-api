import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '@app/core/domain/entities/wallet.entity';
import { Transaction } from '@app/core/domain/entities/transaction.entity';
import { IWalletRepository } from '@app/core/interfaces/repositories/wallet.repository.interface';

@Injectable()
export class WalletRepository implements IWalletRepository {
  constructor(
    @InjectRepository(Wallet)
    private readonly repository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findById(id: string): Promise<Wallet | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUser(userId: string): Promise<Wallet | null> {
    return this.repository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async create(walletData: Partial<Wallet>): Promise<Wallet> {
    const wallet = this.repository.create({
      ...walletData,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.repository.save(wallet);
  }

  async update(id: string, data: Partial<Wallet>): Promise<Wallet> {
    await this.repository.update(id, {
      ...data,
      updatedAt: new Date(),
    });
    return this.findById(id);
  }

  async updateBalance(id: string, amount: number): Promise<Wallet> {
    const wallet = await this.findById(id);
    wallet.balance = amount;
    wallet.updatedAt = new Date();
    return this.repository.save(wallet);
  }

  async getTransactionHistory(
    walletId: string,
    limit: number = 10,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
