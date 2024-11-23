import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateLimitingModule } from './modules/rate-limiting/rate-limiting.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import databaseConfig from './infrastructure/config/typeorm.config';
import redisConfig from './infrastructure/config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    RateLimitingModule,
    AuthModule,
    UserModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
