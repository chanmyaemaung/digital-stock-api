import { Wallet } from '@app/core/domain/entities/wallet.entity';

export interface IWalletRepository {
  findById(id: string): Promise<Wallet | null>;
  findByUser(userId: string): Promise<Wallet | null>;
  create(wallet: Partial<Wallet>): Promise<Wallet>;
  update(id: string, data: Partial<Wallet>): Promise<Wallet>;
  updateBalance(id: string, amount: number): Promise<Wallet>;
}
