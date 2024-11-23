import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IWalletRepository } from '@app/core/interfaces/repositories/wallet.repository.interface';
import { ITransactionRepository } from '@app/core/interfaces/repositories/transaction.repository.interface';
import { TransactionType } from '@app/core/domain/enums/transaction-type.enum';
import { NotificationService } from '@modules/notification/notification.service';
import { NotificationType } from '@app/core/domain/enums/notification-type.enum';

@Injectable()
export class WalletService {
  constructor(
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.findOrCreateWallet(userId);
    return wallet.balance;
  }

  async addBalance(userId: string, amount: number): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.findOrCreateWallet(userId);
    wallet.credit(amount);
    await this.walletRepository.update(wallet.id, wallet);

    // Create transaction record
    await this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.CREDIT,
      amount,
      description: 'Wallet top-up',
    });

    // Send notification
    await this.notificationService.createNotification(
      userId,
      NotificationType.WALLET_CREDITED,
      'Wallet Credited',
      `Your wallet has been credited with $${amount}`,
    );
  }

  async deductBalance(userId: string, amount: number): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.findOrCreateWallet(userId);
    if (!wallet.hasEnoughBalance(amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    wallet.debit(amount);
    await this.walletRepository.update(wallet.id, wallet);

    // Create transaction record
    await this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.DEBIT,
      amount,
      description: 'Balance deduction',
    });

    // Send notification
    await this.notificationService.createNotification(
      userId,
      NotificationType.WALLET_DEBITED,
      'Wallet Debited',
      `Your wallet has been debited with $${amount}`,
    );
  }

  async getTransactionHistory(userId: string, limit?: number) {
    const wallet = await this.findOrCreateWallet(userId);
    return this.transactionRepository.findByWallet(wallet.id, limit);
  }

  public async findOrCreateWallet(userId: string) {
    let wallet = await this.walletRepository.findByUser(userId);
    if (!wallet) {
      wallet = await this.walletRepository.create({ userId });
    }
    return wallet;
  }
}
