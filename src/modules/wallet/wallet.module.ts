import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TransactionService } from './transaction.service';
import { Wallet } from '@app/core/domain/entities/wallet.entity';
import { Transaction } from '@app/core/domain/entities/transaction.entity';
import { WalletRepository } from '@app/infrastructure/persistence/repositories/wallet.repository';
import { TransactionRepository } from '@app/infrastructure/persistence/repositories/transaction.repository';
import { NotificationModule } from '@modules/notification/notification.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction]),
    NotificationModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    TransactionService,
    {
      provide: 'IWalletRepository',
      useClass: WalletRepository,
    },
    {
      provide: 'ITransactionRepository',
      useClass: TransactionRepository,
    },
  ],
  exports: [WalletService, TransactionService],
})
export class WalletModule {}
