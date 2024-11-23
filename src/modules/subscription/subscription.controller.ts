import { Role } from '@app/core/domain/enums/role.enum';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@shared/decorators/roles.decorator';
import { RolesGuard } from '@shared/guards/roles.guard';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscriptions')
@ApiBearerAuth()
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
  @ApiResponse({
    status: 200,
    description: 'Returns active subscription details',
  })
  async getActiveSubscription(@Request() req) {
    return this.subscriptionService.findActiveSubscription(req.user.id);
  }

  @Put('upgrade/:planId')
  @ApiOperation({ summary: 'Upgrade subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Plan upgraded successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async upgradePlan(@Request() req, @Param('planId') planId: string) {
    return this.subscriptionService.upgradePlan(req.user.id, planId);
  }

  @Get('expiring')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get expiring subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of expiring subscriptions',
  })
  async getExpiringSubscriptions() {
    return this.subscriptionService.checkExpiringSubscriptions();
  }

  @Get('expired')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get expired subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of expired subscriptions',
  })
  async getExpiredSubscriptions() {
    return this.subscriptionService.handleExpiredSubscriptions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns subscription details',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async getSubscription(@Param('id') id: string) {
    return this.subscriptionService.findById(id);
  }
}
