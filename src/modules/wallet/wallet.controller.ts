import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { TransactionService } from './transaction.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Returns current balance' })
  async getBalance(@Request() req) {
    const balance = await this.walletService.getBalance(req.user.id);
    return { balance };
  }

  @Post('add')
  @ApiOperation({ summary: 'Add balance to wallet' })
  @ApiResponse({ status: 200, description: 'Balance added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid amount' })
  async addBalance(@Request() req, @Body('amount') amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    await this.walletService.addBalance(req.user.id, amount);
    return {
      message: 'Balance added successfully',
      balance: await this.walletService.getBalance(req.user.id),
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, description: 'Returns transaction history' })
  async getTransactions(
    @Request() req,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.walletService.getTransactionHistory(req.user.id, limit);
  }

  @Get('transactions/latest')
  @ApiOperation({ summary: 'Get latest transactions' })
  @ApiResponse({ status: 200, description: 'Returns latest transactions' })
  async getLatestTransactions(
    @Request() req,
    @Query('limit', ParseIntPipe) limit: number = 5,
  ) {
    const wallet = await this.walletService.findOrCreateWallet(req.user.id);
    return this.transactionService.getLatestTransactions(wallet.id, limit);
  }
}
