import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Returns user notifications' })
  async getUserNotifications(@Request() req) {
    return this.notificationService.getUserNotifications(req.user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  @ApiResponse({ status: 200, description: 'Returns unread notifications' })
  async getUnreadNotifications(@Request() req) {
    return this.notificationService.getUnreadNotifications(req.user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.notificationService.markAsRead(id);
  }
}
