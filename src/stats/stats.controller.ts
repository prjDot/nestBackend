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
  @ApiOperation({ summary: '내 통계 조회' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async getMyStats(@CurrentUserId() userId: string): Promise<{ message: string; data: unknown }> {
    const stats = await this.statsService.getMyStats(userId);
    return {
      message: 'Fetched my stats successfully',
      data: stats
    };
  }
}
