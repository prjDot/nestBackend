import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { BearerAuthGuard } from '../auth/guards/bearer-auth.guard';
import { ApiErrorResponseDto, ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('bearer')
@UseGuards(BearerAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '알림 기록 조회' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async list(
    @CurrentUserId() userId: string,
    @Query('unreadOnly') unreadOnly?: string
  ): Promise<{ message: string; data: unknown }> {
    const notifications = await this.notificationsService.list(userId, unreadOnly);
    return {
      message: 'Fetched notifications successfully',
      data: notifications
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '알림 읽음 처리' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async markAsRead(
    @CurrentUserId() userId: string,
    @Param('id') id: string
  ): Promise<{ message: string; data: unknown }> {
    const notification = await this.notificationsService.markAsRead(userId, id);
    return {
      message: 'Notification marked as read successfully',
      data: notification
    };
  }
}
