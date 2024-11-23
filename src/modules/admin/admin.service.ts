import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUserRepository } from '@app/core/interfaces/repositories/user.repository.interface';
import { ISubscriptionRepository } from '@app/core/interfaces/repositories/subscription.repository.interface';
import { IPaymentRepository } from '@app/core/interfaces/repositories/payment.repository.interface';
import { Role } from '@app/core/domain/enums/role.enum';
import { NotificationService } from '@modules/notification/notification.service';
import { WalletService } from '@modules/wallet/wallet.service';
import { NotificationType } from '@app/core/domain/enums/notification-type.enum';

@Injectable()
export class AdminService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    private readonly notificationService: NotificationService,
    private readonly walletService: WalletService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAllUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.userRepository.findAll(skip, limit);
  }

  async getExpiringSubscriptions(days: number) {
    return this.subscriptionRepository.findExpiringSubscriptions(days);
  }

  async getPendingManualPayments() {
    return this.paymentRepository.findPendingManualPayments();
  }

  async updateUserRole(userId: string, newRole: Role) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.updateRole(newRole);
    await this.userRepository.update(userId, user);

    this.eventEmitter.emit('user.role.updated', { userId, newRole });
    await this.notificationService.createNotification(
      userId,
      NotificationType.ROLE_UPDATED,
      'Role Updated',
      `Your role has been updated to ${newRole}`,
    );

    return user;
  }

  async updateSubscriptionLimit(subscriptionId: string, newLimit: number) {
    const subscription =
      await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.updateRequestLimit(newLimit);
    await this.subscriptionRepository.update(subscriptionId, subscription);

    await this.notificationService.createNotification(
      subscription.userId,
      NotificationType.PLAN_LIMIT_UPDATED,
      'Request Limit Updated',
      `Your daily request limit has been updated to ${newLimit}`,
    );

    return subscription;
  }

  async approveManualPayment(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'pending') {
      throw new BadRequestException('Payment is not pending');
    }

    await this.walletService.addBalance(payment.userId, payment.amount);
    payment.approve();
    await this.paymentRepository.update(paymentId, payment);

    await this.notificationService.createNotification(
      payment.userId,
      NotificationType.PAYMENT_APPROVED,
      'Payment Approved',
      `Your payment of $${payment.amount} has been approved`,
    );

    return payment;
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(userId);
    this.eventEmitter.emit('user.deleted', { userId });
  }
}
