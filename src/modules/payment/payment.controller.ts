import { Role } from '@app/core/domain/enums/role.enum';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@shared/decorators/roles.decorator';
import { RolesGuard } from '@shared/guards/roles.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ManualPaymentDto } from './dto/manual-payment.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({
    summary: 'Initiate a payment',
    description:
      'Create a new payment using either Stripe or manual payment method',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment initiated successfully',
    schema: {
      example: {
        sessionId: 'cs_test_xxx', // For Stripe payments
        paymentId: 'uuid',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async initiatePayment(
    @Request() req,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.initiatePayment(req.user.id, createPaymentDto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook' })
  @ApiResponse({ status: 200, description: 'Webhook handled successfully' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature',
  })
  async handleWebhook(
    @Body() payload: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentService.handleStripeWebhook(payload, signature);
  }

  @Post('manual')
  @ApiOperation({
    summary: 'Create manual payment request',
    description: 'Create a manual payment request that requires admin approval',
  })
  @ApiResponse({
    status: 201,
    description: 'Manual payment created successfully',
    schema: {
      example: {
        id: 'uuid',
        amount: 100,
        status: 'pending',
        reference: 'BANK-123',
        createdAt: '2024-03-15T12:00:00Z',
      },
    },
  })
  async createManualPayment(
    @Request() req,
    @Body() manualPaymentDto: ManualPaymentDto,
  ) {
    return this.paymentService.createManualPayment(
      req.user.id,
      manualPaymentDto,
    );
  }

  @Get('manual/:id/status')
  @ApiOperation({ summary: 'Get manual payment status' })
  @ApiResponse({ status: 200, description: 'Returns payment status' })
  async getManualPaymentStatus(@Param('id') id: string) {
    return this.paymentService.getManualPaymentStatus(id);
  }

  @Get('manual/pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List pending manual payments' })
  @ApiResponse({ status: 200, description: 'Returns pending payments' })
  async listPendingManualPayments() {
    return this.paymentService.listPendingManualPayments();
  }
}
