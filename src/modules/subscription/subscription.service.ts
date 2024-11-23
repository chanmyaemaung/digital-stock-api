import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '@app/core/domain/entities/subscription.entity';
import { Plan } from '@app/core/domain/entities/plan.entity';
import { User } from '@app/core/domain/entities/user.entity';
import { SubscriptionStatus } from '@app/core/domain/enums/subscription-status.enum';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MoreThan, LessThan } from 'typeorm';
import { WalletService } from '@modules/wallet/wallet.service';
import { NotificationService } from '@modules/notification/notification.service';
import { NotificationType } from '@app/core/domain/enums/notification-type.enum';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
    private readonly walletService: WalletService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    userId: string,
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.planRepository.findOne({
      where: { id: createSubscriptionDto.planId },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Check if user has active subscription
    const activeSubscription = await this.findActiveSubscription(userId);
    if (activeSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    const subscription = this.subscriptionRepository.create({
      user,
      plan,
      startDate: new Date(),
      endDate: this.calculateEndDate(createSubscriptionDto.duration),
      status: SubscriptionStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedSubscription =
      await this.subscriptionRepository.save(subscription);

    // Emit subscription created event
    this.eventEmitter.emit('subscription.created', {
      userId,
      planId: plan.id,
      subscription: savedSubscription,
    });

    return savedSubscription;
  }

  private calculateEndDate(durationInDays: number): Date {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationInDays);
    return endDate;
  }

  async findActiveSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(new Date()),
      },
      relations: ['plan'],
    });
  }

  async upgradePlan(userId: string, newPlanId: string): Promise<Subscription> {
    const currentSubscription = await this.findActiveSubscription(userId);
    if (!currentSubscription) {
      throw new BadRequestException('No active subscription found');
    }

    const newPlan = await this.planRepository.findOne({
      where: { id: newPlanId },
    });
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

    // Check wallet balance
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Deduct from wallet
    await this.walletService.deductBalance(userId, proratedCost);

    // Update subscription
    currentSubscription.plan = newPlan;
    currentSubscription.updatedAt = new Date();
    const updatedSubscription =
      await this.subscriptionRepository.save(currentSubscription);

    // Send notification
    await this.notificationService.createNotification(
      userId,
      NotificationType.PLAN_UPGRADED,
      'Plan Upgraded',
      `Your subscription has been upgraded to ${newPlan.name}`,
    );

    return updatedSubscription;
  }

  async checkExpiringSubscriptions(): Promise<void> {
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 3); // 3 days before expiration

    const expiringSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(expiringDate),
      },
      relations: ['user', 'plan'],
    });

    for (const subscription of expiringSubscriptions) {
      await this.notificationService.createNotification(
        subscription.userId,
        NotificationType.SUBSCRIPTION_EXPIRING,
        'Subscription Expiring Soon',
        `Your ${subscription.plan.name} subscription will expire in ${this.calculateRemainingDays(
          subscription.endDate,
        )} days`,
      );
    }
  }

  async handleExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(new Date()),
      },
      relations: ['user', 'plan'],
    });

    for (const subscription of expiredSubscriptions) {
      subscription.expire();
      await this.subscriptionRepository.save(subscription);

      await this.notificationService.createNotification(
        subscription.userId,
        NotificationType.SUBSCRIPTION_EXPIRED,
        'Subscription Expired',
        `Your ${subscription.plan.name} subscription has expired`,
      );
    }
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

  // More methods coming...
}
