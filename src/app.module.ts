import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateLimitingModule } from './modules/rate-limiting/rate-limiting.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { dataSourceOptions } from './infrastructure/database/data-source';
import redisConfig from './infrastructure/config/redis.config';

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
  ],
})
export class AppModule {}
