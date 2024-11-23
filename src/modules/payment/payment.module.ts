import { Payment } from '@app/core/domain/entities/payment.entity';
import { PaymentRepository } from '@app/infrastructure/persistence/repositories/payment.repository';
import { NotificationModule } from '@modules/notification/notification.module';
import { WalletModule } from '@modules/wallet/wallet.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from './services/stripe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    ConfigModule,
    WalletModule,
    NotificationModule,
  ],
  providers: [
    PaymentService,
    StripeService,
    {
      provide: 'IPaymentRepository',
      useClass: PaymentRepository,
    },
  ],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
