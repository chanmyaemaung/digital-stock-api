import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Request() req,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.create(req.user.id, createSubscriptionDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active subscription' })
  @ApiResponse({ status: 200, description: 'Returns active subscription' })
  async getActiveSubscription(@Request() req) {
    return this.subscriptionService.findActiveSubscription(req.user.id);
  }

  @Post('upgrade/:planId')
  @ApiOperation({ summary: 'Upgrade subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan upgraded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async upgradePlan(
    @Request() req,
    @Param('planId', ParseUUIDPipe) planId: string,
  ) {
    return this.subscriptionService.upgradePlan(req.user.id, planId);
  }
}
