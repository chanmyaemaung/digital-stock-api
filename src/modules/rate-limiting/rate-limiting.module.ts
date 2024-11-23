import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisStorageService } from './redis-storage.service';
import { CustomThrottlerGuard } from '@shared/guards/throttle.guard';
import { Redis } from 'ioredis';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('RATE_LIMIT_TTL', 60),
            limit: config.get<number>('RATE_LIMIT_BASIC', 500),
          },
        ],
        storage: new RedisStorageService(
          new Redis({
            host: config.get('REDIS_HOST'),
            port: config.get('REDIS_PORT'),
          }),
        ),
      }),
    }),
  ],
  providers: [
    {
      provide: Redis,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        });
      },
      inject: [ConfigService],
    },
    RedisStorageService,
    CustomThrottlerGuard,
  ],
  exports: [RedisStorageService, CustomThrottlerGuard],
})
export class RateLimitingModule {}
