import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { Redis } from 'ioredis';
import { StorageRecord } from './interfaces/storage-record.interface';

@Injectable()
export class RedisStorageService implements ThrottlerStorage {
  constructor(private readonly redis: Redis) {}

  async increment(key: string, ttl: number): Promise<StorageRecord> {
    const totalHits = await this.redis.incr(key);

    if (totalHits === 1) {
      await this.redis.expire(key, ttl);
    }

    const timeToExpire = await this.redis.ttl(key);
    const isBlocked = await this.redis.get(`blocked:${key}`);
    const timeToBlockExpire = isBlocked
      ? await this.redis.ttl(`blocked:${key}`)
      : 0;

    return {
      totalHits,
      timeToExpire,
      isBlocked: !!isBlocked,
      timeToBlockExpire,
    };
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
