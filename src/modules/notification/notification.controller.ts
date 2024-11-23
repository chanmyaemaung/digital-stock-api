import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Returns list of notifications.' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of notifications to return',
  })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.notificationService.getUserNotifications(userId, limit);
  }

  @Get('user/:userId/unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of unread notifications.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getUnreadNotifications(@Param('userId') userId: string) {
    return this.notificationService.getUnreadNotifications(userId);
  }

  @Post(':id/mark-as-read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
