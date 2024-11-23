import { Role } from '@app/core/domain/enums/role.enum';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { AdminService } from './admin.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { UpdatePlanLimitDto } from './dto/update-plan-limit.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns dashboard statistics',
    type: DashboardStatsDto,
  })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated users list' })
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getUsers(page, limit);
  }

  @Get('subscriptions/expiring')
  @ApiOperation({ summary: 'Get expiring subscriptions' })
  @ApiResponse({ status: 200, description: 'Returns expiring subscriptions' })
  async getExpiringSubscriptions(@Query('days') days: number = 7) {
    return this.adminService.getExpiringSubscriptions(days);
  }

  @Get('payments/pending')
  @ApiOperation({ summary: 'Get pending manual payments' })
  @ApiResponse({ status: 200, description: 'Returns pending payments' })
  async getPendingPayments() {
    return this.adminService.getPendingManualPayments();
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, updateRoleDto.role);
  }

  @Put('subscriptions/:id/limit')
  @ApiOperation({ summary: 'Update subscription request limit' })
  @ApiResponse({ status: 200, description: 'Limit updated successfully' })
  async updateSubscriptionLimit(
    @Param('id') subscriptionId: string,
    @Body() updateLimitDto: UpdatePlanLimitDto,
  ) {
    return this.adminService.updateSubscriptionLimit(
      subscriptionId,
      updateLimitDto.requestLimit,
    );
  }

  @Post('payments/:id/approve')
  @ApiOperation({ summary: 'Approve manual payment' })
  @ApiResponse({ status: 200, description: 'Payment approved successfully' })
  async approvePayment(@Param('id') paymentId: string) {
    return this.adminService.approveManualPayment(paymentId);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }
}
