import { Payment } from '@app/core/domain/entities/payment.entity';
import { Plan } from '@app/core/domain/entities/plan.entity';
import { Subscription } from '@app/core/domain/entities/subscription.entity';
import { User } from '@app/core/domain/entities/user.entity';
import { PaymentRepository } from '@app/infrastructure/persistence/repositories/payment.repository';
import { PlanRepository } from '@app/infrastructure/persistence/repositories/plan.repository';
import { SubscriptionRepository } from '@app/infrastructure/persistence/repositories/subscription.repository';
import { UserRepository } from '@app/infrastructure/persistence/repositories/user.repository';
import { NotificationModule } from '@modules/notification/notification.module';
import { WalletModule } from '@modules/wallet/wallet.module';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Plan, Subscription, Payment]),
    EventEmitterModule.forRoot(),
    WalletModule,
    NotificationModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IPlanRepository',
      useClass: PlanRepository,
    },
    {
      provide: 'ISubscriptionRepository',
      useClass: SubscriptionRepository,
    },
    {
      provide: 'IPaymentRepository',
      useClass: PaymentRepository,
    },
  ],
  exports: [AdminService],
})
export class AdminModule {}
