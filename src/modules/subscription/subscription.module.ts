import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionCron } from './subscription.cron';
import { Subscription } from '@app/core/domain/entities/subscription.entity';
import { Plan } from '@app/core/domain/entities/plan.entity';
import { User } from '@app/core/domain/entities/user.entity';
import { WalletModule } from '@modules/wallet/wallet.module';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Plan, User]),
    EventEmitterModule.forRoot({
      global: false,
    }),
    ScheduleModule.forRoot(),
    WalletModule,
    NotificationModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionCron],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
