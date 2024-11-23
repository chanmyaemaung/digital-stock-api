import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import redisConfig from './infrastructure/config/redis.config';
import { dataSourceOptions } from './infrastructure/database/data-source';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RateLimitingModule } from './modules/rate-limiting/rate-limiting.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({ database: dataSourceOptions }), redisConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
    }),
    RateLimitingModule,
    AuthModule,
    UserModule,
    SubscriptionModule,
    PaymentModule,
  ],
})
export class AppModule {}
