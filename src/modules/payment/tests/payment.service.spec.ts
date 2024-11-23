import { PaymentType } from '@app/core/domain/enums/payment-type.enum';
import { NotificationService } from '@modules/notification/notification.service';
import { WalletService } from '@modules/wallet/wallet.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../payment.service';
import { StripeService } from '../services/stripe.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let mockPaymentRepository;
  let mockWalletService;
  let mockNotificationService;
  let mockStripeService;

  beforeEach(async () => {
    mockPaymentRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findPendingManualPayments: jest.fn(),
    };

    mockWalletService = {
      addBalance: jest.fn(),
    };

    mockNotificationService = {
      createNotification: jest.fn(),
    };

    mockStripeService = {
      createPaymentSession: jest.fn(),
      verifyWebhookSignature: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: 'IPaymentRepository',
          useValue: mockPaymentRepository,
        },
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe('initiatePayment', () => {
    it('should create a stripe payment session', async () => {
      const userId = 'user-123';
      const amount = 100;
      const sessionId = 'session-123';
      const paymentId = 'payment-123';

      mockPaymentRepository.create.mockResolvedValue({ id: paymentId });
      mockStripeService.createPaymentSession.mockResolvedValue(sessionId);

      const result = await service.initiatePayment(userId, {
        amount,
        type: PaymentType.STRIPE,
      });

      expect(result).toEqual({ sessionId, paymentId });
      expect(mockPaymentRepository.create).toHaveBeenCalled();
      expect(mockStripeService.createPaymentSession).toHaveBeenCalled();
    });

    it('should create a manual payment', async () => {
      const userId = 'user-123';
      const amount = 100;
      const reference = 'REF123';

      mockPaymentRepository.create.mockResolvedValue({
        id: 'payment-123',
        amount,
      });

      const result = await service.createManualPayment(userId, {
        amount,
        reference,
      });

      expect(result.amount).toBe(amount);
      expect(mockPaymentRepository.create).toHaveBeenCalled();
      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(
        2,
      );
    });
  });

  // Add more test cases...
});
