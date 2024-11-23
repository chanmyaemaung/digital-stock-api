import { Plan } from '@app/core/domain/entities/plan.entity';
import { Subscription } from '@app/core/domain/entities/subscription.entity';
import { PlanRepository } from '@app/infrastructure/persistence/repositories/plan.repository';
import { SubscriptionRepository } from '@app/infrastructure/persistence/repositories/subscription.repository';
import { NotificationModule } from '@modules/notification/notification.module';
import { WalletModule } from '@modules/wallet/wallet.module';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionCron } from './subscription.cron';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Plan]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    WalletModule,
    NotificationModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionCron,
    {
      provide: 'ISubscriptionRepository',
      useClass: SubscriptionRepository,
    },
    {
      provide: 'IPlanRepository',
      useClass: PlanRepository,
    },
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
