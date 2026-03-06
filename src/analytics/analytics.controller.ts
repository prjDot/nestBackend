import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger';
import { ApiErrorResponseDto, ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import { AnalyticsService } from './analytics.service';
import { PricePositionDto } from './dto/price-position.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':symbol/price-position')
  @ApiOperation({ summary: '종목 가격 위치 분석 (52주 구간 내 위치)' })
  @ApiParam({ name: 'symbol', description: '종목코드 또는 종목명' })
  @ApiOkResponse({
    description: '가격 위치 분석 성공',
    type: ApiSuccessResponseDto,
    schema: {
      example: {
        ok: true,
        status: 200,
        message: 'Request successful',
        data: {
          symbol: '005930',
          name_kr: '삼성전자',
          price: 73000,
          low_52w: 66000,
          high_52w: 86000,
          position_percent: 35,
          updated_at: '2026-03-06T09:10:00Z'
        },
        meta: { requestId: 'req_01hqx8m3f', timestamp: '2026-03-06T09:10:00Z' }
      }
    }
  })
  @ApiNotFoundResponse({ description: '종목을 찾을 수 없음', type: ApiErrorResponseDto })
  async getPricePosition(@Param('symbol') symbol: string): Promise<PricePositionDto> {
    return this.analyticsService.getPricePosition(symbol);
  }
}
