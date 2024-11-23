import { Payment } from '@app/core/domain/entities/payment.entity';
import { PaymentStatus } from '@app/core/domain/enums/payment-status.enum';

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByUser(userId: string): Promise<Payment[]>;
  findByStatus(status: PaymentStatus): Promise<Payment[]>;
  findPendingManualPayments(): Promise<Payment[]>;
  create(payment: Partial<Payment>): Promise<Payment>;
  update(id: string, data: Partial<Payment>): Promise<Payment>;
  updateStatus(id: string, status: PaymentStatus): Promise<Payment>;
}