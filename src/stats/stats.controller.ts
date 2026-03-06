import { Controller, Get, UseGuards } from '@nestjs/common';
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
import { StatsService } from './stats.service';

@ApiTags('Stats')
@ApiBearerAuth('bearer')
@UseGuards(BearerAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me')
  @ApiOperation({
    summary: '내 통계 조회',
    description:
      '관심 종목 수, 알림 수, 최근 조회 심볼, 누적 알림 트리거 횟수를 반환합니다.'
  })
  @ApiOkResponse({
    description: '내 통계 조회 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  async getMyStats(@CurrentUserId() userId: string): Promise<{ message: string; data: unknown }> {
    const stats = await this.statsService.getMyStats(userId);
    return {
      message: 'Fetched my stats successfully',
      data: stats
    };
  }
}
