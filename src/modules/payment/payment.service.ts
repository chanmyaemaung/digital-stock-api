import { NotificationType } from '@app/core/domain/enums/notification-type.enum';
import { PaymentStatus } from '@app/core/domain/enums/payment-status.enum';
import { PaymentType } from '@app/core/domain/enums/payment-type.enum';
import { IPaymentRepository } from '@app/core/interfaces/repositories/payment.repository.interface';
import { NotificationService } from '@modules/notification/notification.service';
import { WalletService } from '@modules/wallet/wallet.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ManualPaymentDto } from './dto/manual-payment.dto';
import { StripeService } from './services/stripe.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    private readonly walletService: WalletService,
    private readonly notificationService: NotificationService,
    private readonly stripeService: StripeService,
  ) {}

  async initiatePayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentRepository.create({
      userId,
      amount: createPaymentDto.amount,
      type: createPaymentDto.type,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (createPaymentDto.type === PaymentType.STRIPE) {
      const sessionId = await this.stripeService.createPaymentSession(
        createPaymentDto.amount,
        { paymentId: payment.id, userId },
      );

      await this.paymentRepository.update(payment.id, {
        stripeSessionId: sessionId,
      });

      return { sessionId, paymentId: payment.id };
    }

    // For manual payments
    await this.notificationService.createNotification(
      userId,
      NotificationType.PAYMENT_RECEIVED,
      'Payment Pending',
      `Your payment of $${createPaymentDto.amount} is pending approval`,
    );

    return payment;
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

        await this.notificationService.createNotification(
          payment.userId,
          NotificationType.PAYMENT_SUCCESSFUL,
          'Payment Successful',
          `Your payment of $${payment.amount} has been processed successfully`,
        );
      }
    }
  }

  async approveManualPayment(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.approve();
    await this.paymentRepository.update(payment.id, payment);
    await this.walletService.addBalance(payment.userId, payment.amount);

    await this.notificationService.createNotification(
      payment.userId,
      NotificationType.PAYMENT_APPROVED,
      'Payment Approved',
      `Your payment of $${payment.amount} has been approved`,
    );

    return payment;
  }

  async createManualPayment(
    userId: string,
    manualPaymentDto: ManualPaymentDto,
  ) {
    const payment = await this.paymentRepository.create({
      userId,
      amount: manualPaymentDto.amount,
      type: PaymentType.MANUAL,
      status: PaymentStatus.PENDING,
      metadata: {
        reference: manualPaymentDto.reference,
        ...manualPaymentDto.metadata,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Notify admin about new manual payment
    await this.notificationService.createNotification(
      'admin', // You might want to get admin IDs from a config
      NotificationType.PAYMENT_RECEIVED,
      'New Manual Payment',
      `New manual payment of $${manualPaymentDto.amount} received from user ${userId}`,
      {
        paymentId: payment.id,
        amount: manualPaymentDto.amount,
        reference: manualPaymentDto.reference,
      },
    );

    // Notify user
    await this.notificationService.createNotification(
      userId,
      NotificationType.PAYMENT_RECEIVED,
      'Payment Pending',
      `Your manual payment of $${manualPaymentDto.amount} is pending approval`,
      {
        paymentId: payment.id,
        reference: manualPaymentDto.reference,
      },
    );

    return payment;
  }

  async getManualPaymentStatus(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return {
      status: payment.status,
      amount: payment.amount,
      reference: payment.metadata?.reference,
      createdAt: payment.createdAt,
    };
  }

  async listPendingManualPayments() {
    return this.paymentRepository.findPendingManualPayments();
  }
}
