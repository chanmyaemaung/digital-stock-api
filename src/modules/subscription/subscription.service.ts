import { NotificationType } from '@app/core/domain/enums/notification-type.enum';
import { SubscriptionStatus } from '@app/core/domain/enums/subscription-status.enum';
import { IPlanRepository } from '@app/core/interfaces/repositories/plan.repository.interface';
import { ISubscriptionRepository } from '@app/core/interfaces/repositories/subscription.repository.interface';
import { NotificationService } from '@modules/notification/notification.service';
import { WalletService } from '@modules/wallet/wallet.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
    private readonly notificationService: NotificationService,
    private readonly walletService: WalletService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
    const plan = await this.planRepository.findById(
      createSubscriptionDto.planId,
    );
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Check if user has enough balance
    const balance = await this.walletService.getBalance(userId);
    if (balance < plan.price) {
      throw new Error('Insufficient balance');
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (createSubscriptionDto.duration || 30));

    // Create subscription
    const subscription = await this.subscriptionRepository.create({
      userId,
      planId: plan.id,
      startDate,
      endDate,
      status: SubscriptionStatus.TRIAL,
      metadata: {
        requestLimit: plan.requestLimit,
      },
    });

    // Deduct balance
    await this.walletService.deductBalance(userId, plan.price);

    // Send notification
    await this.notificationService.createNotification(
      userId,
      NotificationType.SUBSCRIPTION_CREATED,
      'Subscription Created',
      `Your ${plan.name} subscription has been activated`,
    );

    // Emit event
    this.eventEmitter.emit('subscription.created', {
      userId,
      planId: plan.id,
      subscription,
    });

    return subscription;
  }

  async findActiveSubscription(userId: string) {
    return this.subscriptionRepository.findActiveByUser(userId);
  }

  async upgradePlan(userId: string, newPlanId: string) {
    const currentSubscription = await this.findActiveSubscription(userId);
    if (!currentSubscription) {
      throw new Error('No active subscription found');
    }

    const newPlan = await this.planRepository.findById(newPlanId);
    if (!newPlan) {
      throw new NotFoundException('Plan not found');
    }

    // Calculate prorated cost
    const remainingDays = this.calculateRemainingDays(
      currentSubscription.endDate,
    );
    const proratedCost = this.calculateProratedCost(
      newPlan.price,
      currentSubscription.plan.price,
      remainingDays,
    );

    // Check balance
    const balance = await this.walletService.getBalance(userId);
    if (balance < proratedCost) {
      throw new Error('Insufficient balance for upgrade');
    }

    // Deduct prorated cost
    await this.walletService.deductBalance(userId, proratedCost);

    // Update subscription
    const updatedSubscription = await this.subscriptionRepository.update(
      currentSubscription.id,
      {
        planId: newPlan.id,
        metadata: {
          ...currentSubscription.metadata,
          requestLimit: newPlan.requestLimit,
          previousPlan: currentSubscription.planId,
        },
      },
    );

    // Send notification
    await this.notificationService.createNotification(
      userId,
      NotificationType.PLAN_UPGRADED,
      'Plan Upgraded',
      `Your subscription has been upgraded to ${newPlan.name}`,
    );

    return updatedSubscription;
  }

  private calculateRemainingDays(endDate: Date): number {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateProratedCost(
    newPrice: number,
    currentPrice: number,
    remainingDays: number,
  ): number {
    const monthlyDifference = newPrice - currentPrice;
    return (monthlyDifference * remainingDays) / 30;
  }

  async handleExpiredSubscriptions() {
    const expiredSubscriptions =
      await this.subscriptionRepository.findExpired();

    for (const subscription of expiredSubscriptions) {
      subscription.expire();
      await this.subscriptionRepository.update(subscription.id, subscription);

      await this.notificationService.createNotification(
        subscription.userId,
        NotificationType.SUBSCRIPTION_EXPIRED,
        'Subscription Expired',
        `Your subscription has expired`,
      );
    }
  }

  async checkExpiringSubscriptions() {
    const expiringSubscriptions =
      await this.subscriptionRepository.findExpiringSubscriptions(3);

    for (const subscription of expiringSubscriptions) {
      await this.notificationService.createNotification(
        subscription.userId,
        NotificationType.SUBSCRIPTION_EXPIRING,
        'Subscription Expiring Soon',
        `Your subscription will expire in ${this.calculateRemainingDays(
          subscription.endDate,
        )} days`,
      );
    }
  }

  async findById(id: string) {
    const subscription = await this.subscriptionRepository.findById(id);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  async resetAllDailyRequestCounts() {
    const activeSubscriptions = await this.subscriptionRepository.findByStatus(
      SubscriptionStatus.ACTIVE,
    );

    for (const subscription of activeSubscriptions) {
      subscription.resetDailyRequestCount();
      await this.subscriptionRepository.update(subscription.id, subscription);

      await this.notificationService.createNotification(
        subscription.userId,
        NotificationType.DAILY_LIMIT_RESET,
        'Daily Limit Reset',
        `Your daily request limit has been reset`,
      );
    }
  }

  async incrementRequestCount(userId: string): Promise<boolean> {
    const subscription = await this.findActiveSubscription(userId);
    if (!subscription) {
      return false;
    }

    const requestLimit = subscription.metadata?.requestLimit || 0;
    if (subscription.dailyRequestCount >= requestLimit) {
      await this.notificationService.createNotification(
        userId,
        NotificationType.REQUEST_LIMIT_EXCEEDED,
        'Request Limit Exceeded',
        `You have reached your daily request limit of ${requestLimit}`,
      );
      return false;
    }

    subscription.incrementDailyRequestCount();
    await this.subscriptionRepository.update(subscription.id, subscription);
    return true;
  }
}
