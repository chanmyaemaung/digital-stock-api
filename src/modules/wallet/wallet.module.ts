import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet } from '@app/core/domain/entities/wallet.entity';
import { User } from '@app/core/domain/entities/user.entity';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, User]), NotificationModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
