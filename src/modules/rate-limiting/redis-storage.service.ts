import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';

@Injectable()
export class RedisStorageService implements ThrottlerStorage {
  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
  ): Promise<{ totalHits: number; timeToExpire: number }> {
    const multi = this.redis.multi();
    multi.incr(key);
    multi.pttl(key);

    const results = await multi.exec();
    const hits = results[0][1] as number;
    const timeToExpire = results[1][1] as number;

    if (hits === 1) {
      await this.redis.pexpire(key, ttl);
    }

    return {
      totalHits: hits,
      timeToExpire: timeToExpire === -1 ? ttl : timeToExpire,
    };
  }

  async get(key: string): Promise<{ totalHits: number; timeToExpire: number }> {
    const [hits, ttl] = await Promise.all([
      this.redis.get(key),
      this.redis.pttl(key),
    ]);

    return {
      totalHits: hits ? parseInt(hits, 10) : 0,
      timeToExpire: ttl,
    };
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
