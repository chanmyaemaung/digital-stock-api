import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { StorageRecord } from './interfaces/storage-record.interface';

@Injectable()
export class RedisStorageService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  async increment(key: string): Promise<number> {
    const count = await this.redisClient.incr(key);
    return count;
  }

  async get(key: string): Promise<StorageRecord> {
    const value = await this.redisClient.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value);
  }

  async set(key: string, value: StorageRecord, ttl: number): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async reset(key: string): Promise<void> {
    await this.redisClient.set(key, '0');
  }
}
