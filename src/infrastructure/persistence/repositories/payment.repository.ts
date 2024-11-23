import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '@app/core/domain/entities/payment.entity';
import { IPaymentRepository } from '@app/core/interfaces/repositories/payment.repository.interface';
import { PaymentStatus } from '@app/core/domain/enums/payment-status.enum';
import { PaymentType } from '@app/core/domain/enums/payment-type.enum';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
  ) {}

  async findById(id: string): Promise<Payment | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUser(userId: string): Promise<Payment[]> {
    return this.repository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.repository.find({
      where: { status },
      relations: ['user'],
    });
  }

  async findPendingManualPayments(): Promise<Payment[]> {
    return this.repository.find({
      where: {
        status: PaymentStatus.PENDING,
        type: PaymentType.MANUAL,
      },
      relations: ['user'],
    });
  }

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = this.repository.create(paymentData);
    return this.repository.save(payment);
  }

  async update(id: string, data: Partial<Payment>): Promise<Payment> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
    await this.repository.update(id, { status });
    return this.findById(id);
  }
}
