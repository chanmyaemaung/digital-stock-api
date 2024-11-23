import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '@app/core/domain/entities/subscription.entity';
import { Plan } from '@app/core/domain/entities/plan.entity';
import { SubscriptionRepository } from '@app/infrastructure/persistence/repositories/subscription.repository';
import { PlanRepository } from '@app/infrastructure/persistence/repositories/plan.repository';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Plan])],
  providers: [
    {
      provide: 'ISubscriptionRepository',
      useClass: SubscriptionRepository,
    },
    {
      provide: 'IPlanRepository',
      useClass: PlanRepository,
    },
    SubscriptionService,
  ],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
