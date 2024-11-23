import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisStorageService } from './redis-storage.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redis = new Redis({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          enableReadyCheck: false,
          maxRetriesPerRequest: 0,
        });

        return {
          throttlers: [
            {
              ttl: config.get('RATE_LIMIT_TTL', 60),
              limit: config.get('RATE_LIMIT_BASIC', 10),
            },
          ],
          storage: new RedisStorageService(redis),
        };
      },
    }),
  ],
  providers: [
    RedisStorageService,
    {
      provide: Redis,
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          enableReadyCheck: false,
          maxRetriesPerRequest: 0,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [ThrottlerModule, RedisStorageService],
})
export class RateLimitingModule {}
