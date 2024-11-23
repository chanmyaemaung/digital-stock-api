import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Returns current balance' })
  async getBalance(@Request() req) {
    return {
      balance: await this.walletService.getBalance(req.user.id),
    };
  }

  @Post('add')
  @ApiOperation({ summary: 'Add balance to wallet' })
  @ApiResponse({ status: 200, description: 'Balance added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid amount' })
  async addBalance(@Request() req, @Body('amount') amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    const wallet = await this.walletService.addBalance(req.user.id, amount);
    return {
      message: 'Balance added successfully',
      balance: wallet.balance,
    };
  }
}
