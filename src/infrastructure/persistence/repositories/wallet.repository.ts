import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '@app/core/domain/entities/wallet.entity';
import { IWalletRepository } from '@app/core/interfaces/repositories/wallet.repository.interface';

@Injectable()
export class WalletRepository implements IWalletRepository {
  constructor(
    @InjectRepository(Wallet)
    private readonly repository: Repository<Wallet>,
  ) {}

  async findById(id: string): Promise<Wallet | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUser(userId: string): Promise<Wallet | null> {
    return this.repository.findOne({ where: { userId } });
  }

  async create(walletData: Partial<Wallet>): Promise<Wallet> {
    const wallet = this.repository.create(walletData);
    return this.repository.save(wallet);
  }

  async update(id: string, data: Partial<Wallet>): Promise<Wallet> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async updateBalance(id: string, amount: number): Promise<Wallet> {
    const wallet = await this.findById(id);
    wallet.balance = amount;
    return this.repository.save(wallet);
  }
}
