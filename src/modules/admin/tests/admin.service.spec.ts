import { NotificationType } from '@app/core/domain/enums/notification-type.enum';
import { Role } from '@app/core/domain/enums/role.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let mockUserRepository;
  let mockSubscriptionRepository;
  let mockPaymentRepository;
  let mockNotificationService;
  let mockWalletService;
  let mockEventEmitter;

  beforeEach(async () => {
    mockUserRepository = {
      find: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getUserGrowth: jest.fn(),
    };

    mockSubscriptionRepository = {
      findById: jest.fn(),
      findByStatus: jest.fn(),
      findExpiringSubscriptions: jest.fn(),
      update: jest.fn(),
      countByStatus: jest.fn(),
    };

    mockPaymentRepository = {
      findById: jest.fn(),
      findByStatus: jest.fn(),
      findPendingManualPayments: jest.fn(),
      update: jest.fn(),
      countByStatus: jest.fn(),
      findByDateRange: jest.fn(),
      getRevenueGrowth: jest.fn(),
    };

    mockNotificationService = {
      createNotification: jest.fn(),
    };

    mockWalletService = {
      addBalance: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'ISubscriptionRepository',
          useValue: mockSubscriptionRepository,
        },
        {
          provide: 'IPaymentRepository',
          useValue: mockPaymentRepository,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      // Arrange
      const mockStats = {
        totalUsers: 100,
        activeSubscriptions: 80,
        expiringSubscriptions: 5,
        pendingPayments: 10,
        planDistribution: { basic: 30, premium: 40, business: 10 },
        revenue: { total: 5000, thisMonth: 1000 },
        userGrowth: [{ date: '2024-03-01', count: 10 }],
        revenueGrowth: [{ date: '2024-03-01', amount: 500 }],
      };

      mockUserRepository.count.mockResolvedValue(mockStats.totalUsers);
      mockSubscriptionRepository.countByStatus.mockResolvedValue(
        mockStats.activeSubscriptions,
      );
      mockSubscriptionRepository.findExpiringSubscriptions.mockResolvedValue(
        new Array(mockStats.expiringSubscriptions),
      );
      mockPaymentRepository.countByStatus.mockResolvedValue(
        mockStats.pendingPayments,
      );
      mockSubscriptionRepository.findByStatus.mockResolvedValue([
        { plan: { name: 'Basic' } },
        { plan: { name: 'Premium' } },
      ]);
      mockPaymentRepository.findByStatus.mockResolvedValue([
        { amount: 1000 },
        { amount: 2000 },
      ]);
      mockPaymentRepository.findByDateRange.mockResolvedValue([
        { amount: 500 },
        { amount: 500 },
      ]);
      mockUserRepository.getUserGrowth.mockResolvedValue(mockStats.userGrowth);
      mockPaymentRepository.getRevenueGrowth.mockResolvedValue(
        mockStats.revenueGrowth,
      );

      // Act
      const result = await service.getDashboardStats();

      // Assert
      expect(result).toBeDefined();
      expect(result.totalUsers).toBe(mockStats.totalUsers);
      expect(result.activeSubscriptions).toBe(mockStats.activeSubscriptions);
      expect(result.expiringSubscriptions).toBe(
        mockStats.expiringSubscriptions,
      );
      expect(result.pendingPayments).toBe(mockStats.pendingPayments);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role and send notification', async () => {
      // Arrange
      const userId = 'user-123';
      const newRole = Role.ADMIN;
      const mockUser = {
        id: userId,
        updateRole: jest.fn(),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(mockUser);

      // Act
      await service.updateUserRole(userId, newRole);

      // Assert
      expect(mockUser.updateRole).toHaveBeenCalledWith(newRole);
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        userId,
        NotificationType.ROLE_UPDATED,
        'Role Updated',
        expect.any(String),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.role.updated', {
        userId,
        newRole,
      });
    });
  });

  describe('approveManualPayment', () => {
    it('should approve payment and update wallet balance', async () => {
      // Arrange
      const paymentId = 'payment-123';
      const mockPayment = {
        id: paymentId,
        userId: 'user-123',
        amount: 100,
        status: 'pending',
        approve: jest.fn(),
      };

      mockPaymentRepository.findById.mockResolvedValue(mockPayment);
      mockPaymentRepository.update.mockResolvedValue(mockPayment);

      // Act
      await service.approveManualPayment(paymentId);

      // Assert
      expect(mockPayment.approve).toHaveBeenCalled();
      expect(mockWalletService.addBalance).toHaveBeenCalledWith(
        mockPayment.userId,
        mockPayment.amount,
      );
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        mockPayment.userId,
        NotificationType.PAYMENT_APPROVED,
        'Payment Approved',
        expect.any(String),
      );
    });
  });
});
