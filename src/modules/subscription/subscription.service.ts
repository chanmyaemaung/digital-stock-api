import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ISubscriptionRepository } from '@app/core/interfaces/repositories/subscription.repository.interface';
import { IPlanRepository } from '@app/core/interfaces/repositories/plan.repository.interface';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionStatus } from '@app/core/domain/enums/subscription-status.enum';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const plan = await this.planRepository.findById(
      createSubscriptionDto.planId,
    );
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Calculate end date (30 days from start date)
    const endDate = new Date(createSubscriptionDto.startDate);
    endDate.setDate(endDate.getDate() + 30);

    const subscription = await this.subscriptionRepository.create({
      ...createSubscriptionDto,
      endDate,
      status: SubscriptionStatus.ACTIVE,
      dailyRequestCount: 0,
      lastRequestReset: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return subscription;
  }

  async checkAndIncrementRequestCount(userId: string): Promise<boolean> {
    const subscription =
      await this.subscriptionRepository.findActiveByUser(userId);
    if (!subscription) {
      throw new BadRequestException('No active subscription found');
    }

    return subscription.incrementRequestCount();
  }

  async getUserSubscription(userId: string) {
    return this.subscriptionRepository.findActiveByUser(userId);
  }

  async getExpiringSubscriptions(daysUntilExpiration: number) {
    return this.subscriptionRepository.findExpiringSubscriptions(
      daysUntilExpiration,
    );
  }
}
