import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPaymentRepository } from '@app/core/interfaces/repositories/payment.repository.interface';
import { WalletService } from '@modules/wallet/wallet.service';
import { StripeService } from './services/stripe.service';
import { PaymentType } from '@app/core/domain/enums/payment-type.enum';
import { PaymentStatus } from '@app/core/domain/enums/payment-status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    private readonly walletService: WalletService,
    private readonly stripeService: StripeService,
  ) {}

  async initiateStripePayment(userId: string, amount: number) {
    const payment = await this.paymentRepository.create({
      userId,
      amount,
      type: PaymentType.STRIPE,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const sessionId = await this.stripeService.createPaymentSession(amount, {
      paymentId: payment.id,
      userId,
    });

    await this.paymentRepository.update(payment.id, {
      stripeSessionId: sessionId,
    });

    return { sessionId, paymentId: payment.id };
  }

  async handleStripeWebhook(payload: any, signature: string) {
    const isValid = await this.stripeService.verifyWebhookSignature(
      payload,
      signature,
    );
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const event = JSON.parse(payload.toString());
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const payment = await this.paymentRepository.findById(
        session.metadata.paymentId,
      );

      if (payment) {
        payment.markAsCompleted();
        await this.paymentRepository.update(payment.id, payment);
        await this.walletService.addBalance(payment.userId, payment.amount);
      }
    }
  }

  async createManualPayment(userId: string, amount: number) {
    return this.paymentRepository.create({
      userId,
      amount,
      type: PaymentType.MANUAL,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async approveManualPayment(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.markAsCompleted();
    await this.paymentRepository.update(payment.id, payment);
    await this.walletService.addBalance(payment.userId, payment.amount);

    return payment;
  }
}
