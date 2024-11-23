import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { Role } from '@app/core/domain/enums/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('stripe/initiate')
  @ApiOperation({ summary: 'Initiate a Stripe payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment session created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'uuid' },
        amount: { type: 'number', minimum: 0 },
      },
    },
  })
  async initiateStripePayment(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
  ) {
    return this.paymentService.initiateStripePayment(userId, amount);
  }

  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook handled successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature.' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature',
  })
  async handleStripeWebhook(
    @Body() payload: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentService.handleStripeWebhook(payload, signature);
  }

  @Post('manual')
  @ApiOperation({ summary: 'Create a manual payment request' })
  @ApiResponse({ status: 201, description: 'Manual payment request created.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'uuid' },
        amount: { type: 'number', minimum: 0 },
      },
    },
  })
  async createManualPayment(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
  ) {
    return this.paymentService.createManualPayment(userId, amount);
  }

  @Post('manual/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Approve a manual payment' })
  @ApiResponse({ status: 200, description: 'Payment approved successfully.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only.' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async approveManualPayment(@Param('id') id: string) {
    return this.paymentService.approveManualPayment(id);
  }
}
