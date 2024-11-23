import { Payment } from '@app/core/domain/entities/payment.entity';
import { PaymentStatus } from '@app/core/domain/enums/payment-status.enum';
import { PaymentType } from '@app/core/domain/enums/payment-type.enum';
import { IPaymentRepository } from '@app/core/interfaces/repositories/payment.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

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

  async countByStatus(status: PaymentStatus): Promise<number> {
    return this.repository.count({
      where: { status },
    });
  }

  async getRevenueGrowth(
    startDate: Date,
  ): Promise<Array<{ date: string; amount: number }>> {
    const payments = await this.repository.find({
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: Between(startDate, new Date()),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const dailyRevenue = payments.reduce((acc, payment) => {
      const date = payment.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {});

    return Object.entries(dailyRevenue).map(([date, amount]) => ({
      date,
      amount: amount as number,
    }));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    return this.repository.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: PaymentStatus.COMPLETED,
      },
      relations: ['user'],
    });
  }
}
