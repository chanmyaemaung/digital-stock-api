import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '@modules/user/user.module';
import { SubscriptionModule } from '@modules/subscription/subscription.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { WalletModule } from '@modules/wallet/wallet.module';

@Module({
  imports: [
    UserModule,
    SubscriptionModule,
    PaymentModule,
    NotificationModule,
    WalletModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
