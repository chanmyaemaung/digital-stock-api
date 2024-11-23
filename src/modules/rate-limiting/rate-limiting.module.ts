import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from '@shared/guards/throttle.guard';
import { Redis } from 'ioredis';
import { RedisStorageService } from './redis-storage.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL'),
            limit: configService.get<number>('THROTTLE_LIMIT'),
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
          username: configService.get('REDIS_USERNAME'),
          db: configService.get('REDIS_DB'),
        });
      },
      inject: [ConfigService],
    },
    RedisStorageService,
    CustomThrottlerGuard,
  ],
  exports: [RedisStorageService, CustomThrottlerGuard, 'REDIS_CLIENT'],
})
export class RateLimitingModule {}
