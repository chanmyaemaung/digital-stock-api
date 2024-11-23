import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class SubscriptionCron {
  private readonly logger = new Logger(SubscriptionCron.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSubscriptions() {
    this.logger.log('Checking for expired subscriptions...');
    try {
      await this.subscriptionService.handleExpiredSubscriptions();
    } catch (error) {
      this.logger.error('Error handling expired subscriptions:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkExpiringSubscriptions() {
    this.logger.log('Checking for expiring subscriptions...');
    try {
      await this.subscriptionService.checkExpiringSubscriptions();
    } catch (error) {
      this.logger.error('Error checking expiring subscriptions:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyRequestCounts() {
    this.logger.log('Resetting daily request counts...');
    try {
      await this.subscriptionService.resetAllDailyRequestCounts();
      this.logger.log('Daily request counts reset successfully');
    } catch (error) {
      this.logger.error('Error resetting daily request counts:', error);
    }
  }
}
