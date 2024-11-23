import { NotificationType } from '@app/core/domain/enums/notification-type.enum';
import { PaymentStatus } from '@app/core/domain/enums/payment-status.enum';
import { Role } from '@app/core/domain/enums/role.enum';
import { SubscriptionStatus } from '@app/core/domain/enums/subscription-status.enum';
import { IPaymentRepository } from '@app/core/interfaces/repositories/payment.repository.interface';
import { ISubscriptionRepository } from '@app/core/interfaces/repositories/subscription.repository.interface';
import { IUserRepository } from '@app/core/interfaces/repositories/user.repository.interface';
import { NotificationService } from '@modules/notification/notification.service';
import { WalletService } from '@modules/wallet/wallet.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

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

  async getUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userRepository.find({ skip, take: limit }),
      this.userRepository.count(),
    ]);

    return {
      users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const [
      totalUsers,
      activeSubscriptions,
      expiringSubscriptions,
      pendingPayments,
      planDistribution,
      revenue,
      userGrowth,
      revenueGrowth,
    ] = await Promise.all([
      this.userRepository.count(),
      this.subscriptionRepository.countByStatus(SubscriptionStatus.ACTIVE),
      this.subscriptionRepository.findExpiringSubscriptions(7),
      this.paymentRepository.countByStatus(PaymentStatus.PENDING),
      this.calculatePlanDistribution(),
      this.calculateRevenue(),
      this.calculateUserGrowth(),
      this.calculateRevenueGrowth(),
    ]);

    return {
      totalUsers,
      activeSubscriptions,
      expiringSubscriptions: expiringSubscriptions.length,
      pendingPayments,
      planDistribution,
      revenue,
      userGrowth,
      revenueGrowth,
    };
  }

  private async calculatePlanDistribution(): Promise<Record<string, number>> {
    const subscriptions = await this.subscriptionRepository.findByStatus(
      SubscriptionStatus.ACTIVE,
    );

    return subscriptions.reduce((acc, sub) => {
      const planName = sub.plan.name.toLowerCase();
      acc[planName] = (acc[planName] || 0) + 1;
      return acc;
    }, {});
  }

  private async calculateRevenue(): Promise<{
    total: number;
    thisMonth: number;
  }> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPayments, monthlyPayments] = await Promise.all([
      this.paymentRepository.findByStatus(PaymentStatus.COMPLETED),
      this.paymentRepository.findByDateRange(firstDayOfMonth, now),
    ]);

    return {
      total: totalPayments.reduce((sum, payment) => sum + payment.amount, 0),
      thisMonth: monthlyPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      ),
    };
  }

  private async calculateUserGrowth(): Promise<
    Array<{ date: string; count: number }>
  > {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    return this.userRepository.getUserGrowth(last30Days);
  }

  private async calculateRevenueGrowth(): Promise<
    Array<{ date: string; amount: number }>
  > {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    return this.paymentRepository.getRevenueGrowth(last30Days);
  }
}
