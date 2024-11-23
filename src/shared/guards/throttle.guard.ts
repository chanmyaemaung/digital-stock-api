import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    private readonly configService: ConfigService,
    throttlerStorage: ThrottlerStorage,
    reflector: Reflector,
  ) {
    const options: ThrottlerModuleOptions = {
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
      storage: throttlerStorage,
    };
    super(options, throttlerStorage, reflector);
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    const user = context.switchToHttp().getRequest().user;
    if (!user) {
      return this.configService.get<number>('RATE_LIMIT_BASIC', 500);
    }

    switch (user.subscription?.plan?.name?.toLowerCase()) {
      case 'premium':
        return this.configService.get<number>('RATE_LIMIT_PREMIUM', 1500);
      case 'business':
        return this.configService.get<number>('RATE_LIMIT_BUSINESS', 10000);
      default:
        return this.configService.get<number>('RATE_LIMIT_BASIC', 500);
    }
  }
}
