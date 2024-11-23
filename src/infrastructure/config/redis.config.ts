import { registerAs } from '@nestjs/config';
import type { RedisClientOptions } from 'redis';

interface RedisConfig extends RedisClientOptions {
  ttl: number;
  rateLimit: {
    ttl: number;
    basic: number;
    premium: number;
    business: number;
    blockTtl: number;
  };
}

export default registerAs(
  'redis',
  (): RedisConfig => ({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    },
    ttl: parseInt(process.env.REDIS_TTL, 10) || 60,
    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
      basic: parseInt(process.env.RATE_LIMIT_BASIC, 10) || 500,
      premium: parseInt(process.env.RATE_LIMIT_PREMIUM, 10) || 1500,
      business: parseInt(process.env.RATE_LIMIT_BUSINESS, 10) || 10000,
      blockTtl: parseInt(process.env.RATE_LIMIT_BLOCK_TTL, 10) || 3600,
    },
  }),
);
