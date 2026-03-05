import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
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
  @ApiOperation({
    summary: '알림 기록 조회',
    description: '`unreadOnly=true`로 아직 읽지 않은 알림만 조회할 수 있습니다.'
  })
  @ApiQuery({
    name: 'unreadOnly',
    required: false,
    description: '읽지 않은 알림만 조회',
    schema: {
      type: 'string',
      enum: ['true']
    }
  })
  @ApiOkResponse({
    description: '알림 기록 조회 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
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
  @ApiOperation({
    summary: '알림 읽음 처리',
    description: '지정한 알림의 `readAt`을 현재 시각으로 기록하고 상태를 `opened`로 바꿉니다.'
  })
  @ApiParam({
    name: 'id',
    description: '알림 UUID'
  })
  @ApiOkResponse({
    description: '알림 읽음 처리 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiNotFoundResponse({
    description: '알림을 찾을 수 없음',
    type: ApiErrorResponseDto
  })
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
