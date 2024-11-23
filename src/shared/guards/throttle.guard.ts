import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    private readonly configService: ConfigService,
    storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(
      {
        throttlers: [
          {
            ttl: configService.get('RATE_LIMIT_TTL', 60),
            limit: configService.get('RATE_LIMIT_BASIC', 10),
          },
        ],
      },
      storageService,
      reflector,
    );
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id ? `user-${req.user.id}` : `ip-${req.ip}`;
  }

  protected getLimit(context: ExecutionContext): number {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return this.configService.get('RATE_LIMIT_BASIC', 10);
    }

    switch (user.subscription?.plan?.name?.toLowerCase()) {
      case 'premium':
        return this.configService.get('RATE_LIMIT_PREMIUM', 1500);
      case 'business':
        return this.configService.get('RATE_LIMIT_BUSINESS', 10000);
      default:
        return this.configService.get('RATE_LIMIT_BASIC', 500);
    }
  }
}
