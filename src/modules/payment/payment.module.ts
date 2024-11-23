import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@app/core/domain/entities/payment.entity';
import { PaymentRepository } from '@app/infrastructure/persistence/repositories/payment.repository';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { StripeService } from './services/stripe.service';
import { WalletModule } from '@modules/wallet/wallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), WalletModule],
  providers: [
    {
      provide: 'IPaymentRepository',
      useClass: PaymentRepository,
    },
    PaymentService,
    StripeService,
  ],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
