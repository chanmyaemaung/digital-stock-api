import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IWalletRepository } from '@app/core/interfaces/repositories/wallet.repository.interface';

@Injectable()
export class WalletService {
  constructor(
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,
  ) {}

  async getWallet(userId: string) {
    const wallet = await this.walletRepository.findByUser(userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async createWallet(userId: string) {
    return this.walletRepository.create({
      userId,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async addBalance(userId: string, amount: number) {
    const wallet = await this.getWallet(userId);
    wallet.addBalance(amount);
    return this.walletRepository.update(wallet.id, wallet);
  }

  async deductBalance(userId: string, amount: number) {
    const wallet = await this.getWallet(userId);
    if (!wallet.deductBalance(amount)) {
      throw new Error('Insufficient balance');
    }
    return this.walletRepository.update(wallet.id, wallet);
  }
}
