import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '@app/core/domain/entities/wallet.entity';
import { User } from '@app/core/domain/entities/user.entity';
import { NotificationService } from '@modules/notification/notification.service';
import { NotificationType } from '@app/core/domain/enums/notification-type.enum';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.findOrCreateWallet(userId);
    return wallet.balance;
  }

  async addBalance(userId: string, amount: number): Promise<Wallet> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.findOrCreateWallet(userId);
    wallet.balance += amount;
    wallet.updatedAt = new Date();

    const updatedWallet = await this.walletRepository.save(wallet);

    // Send notification
    await this.notificationService.createNotification(
      userId,
      NotificationType.WALLET_CREDITED,
      'Wallet Credited',
      `Your wallet has been credited with $${amount}`,
    );

    return updatedWallet;
  }

  async deductBalance(userId: string, amount: number): Promise<Wallet> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.findOrCreateWallet(userId);
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    wallet.balance -= amount;
    wallet.updatedAt = new Date();

    const updatedWallet = await this.walletRepository.save(wallet);

    // Send notification
    await this.notificationService.createNotification(
      userId,
      NotificationType.WALLET_DEBITED,
      'Wallet Debited',
      `Your wallet has been debited with $${amount}`,
    );

    return updatedWallet;
  }

  private async findOrCreateWallet(userId: string): Promise<Wallet> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        user,
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.walletRepository.save(wallet);
    }

    return wallet;
  }
}
