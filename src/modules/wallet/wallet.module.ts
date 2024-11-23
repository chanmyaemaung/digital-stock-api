import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '@app/core/domain/entities/wallet.entity';
import { WalletRepository } from '@app/infrastructure/persistence/repositories/wallet.repository';
import { WalletService } from './wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  providers: [
    {
      provide: 'IWalletRepository',
      useClass: WalletRepository,
    },
    WalletService,
  ],
  exports: [WalletService],
})
export class WalletModule {}
