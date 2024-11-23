import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { Role } from '@app/core/domain/enums/role.enum';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdatePlanLimitDto } from './dto/update-plan-limit.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({ status: 200, description: 'Return list of users.' })
  async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.adminService.getAllUsers(page, limit);
  }

  @Get('subscriptions/expiring')
  @ApiOperation({ summary: 'Get expiring subscriptions' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Days until expiration',
  })
  @ApiResponse({
    status: 200,
    description: 'Return list of expiring subscriptions.',
  })
  async getExpiringSubscriptions(@Query('days') days = 7) {
    return this.adminService.getExpiringSubscriptions(days);
  }

  @Get('payments/pending')
  @ApiOperation({ summary: 'Get pending manual payments' })
  @ApiResponse({
    status: 200,
    description: 'Return list of pending manual payments.',
  })
  async getPendingPayments() {
    return this.adminService.getPendingManualPayments();
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiResponse({ status: 200, description: 'User role updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, updateRoleDto.role);
  }

  @Put('subscriptions/:id/limit')
  @ApiOperation({ summary: 'Update subscription request limit' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiBody({ type: UpdatePlanLimitDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription limit updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  async updateSubscriptionLimit(
    @Param('id') subscriptionId: string,
    @Body() updateLimitDto: UpdatePlanLimitDto,
  ) {
    return this.adminService.updateSubscriptionLimit(
      subscriptionId,
      updateLimitDto.newLimit,
    );
  }

  @Post('payments/:id/approve')
  @ApiOperation({ summary: 'Approve manual payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment approved successfully.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  @ApiResponse({ status: 400, description: 'Payment is not pending.' })
  async approvePayment(@Param('id') paymentId: string) {
    return this.adminService.approveManualPayment(paymentId);
  }

  @Delete('users/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin only.' })
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }
}
