import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class SubscriptionCron {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSubscriptions() {
    await this.subscriptionService.handleExpiredSubscriptions();
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkExpiringSubscriptions() {
    await this.subscriptionService.checkExpiringSubscriptions();
  }
}
