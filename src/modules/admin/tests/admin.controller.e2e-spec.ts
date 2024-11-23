import { Role } from '@app/core/domain/enums/role.enum';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '@shared/guards/roles.guard';
import * as request from 'supertest';
import { AdminModule } from '../admin.module';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdminModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get JWT token for admin user
    // This would typically be done by calling your auth endpoint
    jwtToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/admin/dashboard (GET)', () => {
    it('should return dashboard statistics', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalUsers');
          expect(res.body).toHaveProperty('activeSubscriptions');
          expect(res.body).toHaveProperty('expiringSubscriptions');
          expect(res.body).toHaveProperty('pendingPayments');
          expect(res.body).toHaveProperty('planDistribution');
          expect(res.body).toHaveProperty('revenue');
          expect(res.body).toHaveProperty('userGrowth');
          expect(res.body).toHaveProperty('revenueGrowth');
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer()).get('/admin/dashboard').expect(401);
    });
  });

  describe('/admin/users/:id/role (PUT)', () => {
    it('should update user role', () => {
      const userId = 'user-123';
      const newRole = Role.ADMIN;

      return request(app.getHttpServer())
        .put(`/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ role: newRole })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('role', newRole);
        });
    });
  });

  describe('/admin/payments/:id/approve (POST)', () => {
    it('should approve manual payment', () => {
      const paymentId = 'payment-123';

      return request(app.getHttpServer())
        .post(`/admin/payments/${paymentId}/approve`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', paymentId);
          expect(res.body).toHaveProperty('status', 'completed');
        });
    });
  });
});
