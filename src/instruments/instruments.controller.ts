import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { ApiErrorResponseDto, ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import { InstrumentsService } from './instruments.service';
import { InstrumentDto, InstrumentDetailDto } from './dto/instrument.dto';

@ApiTags('Instruments')
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get('search')
  @ApiOperation({ summary: '종목 검색' })
  @ApiQuery({ name: 'q', required: true, description: '검색어 (종목코드 또는 종목명)' })
  @ApiQuery({ name: 'limit', required: false, description: '최대 결과 개수 (기본값: 10)' })
  @ApiOkResponse({
    description: '종목 검색 성공',
    type: ApiSuccessResponseDto,
    schema: {
      example: {
        ok: true,
        status: 200,
        message: 'Request successful',
        data: [
          { symbol: '005930', name_kr: '삼성전자', market: 'KR' },
          { symbol: '000660', name_kr: 'SK하이닉스', market: 'KR' }
        ],
        meta: { requestId: 'req_01hqx8m3f', timestamp: '2026-03-06T09:10:00Z' }
      }
    }
  })
  @ApiBadRequestResponse({ description: '잘못된 검색어', type: ApiErrorResponseDto })
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: number
  ): Promise<InstrumentDto[]> {
    return this.instrumentsService.search(query, limit);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: '종목 자동완성' })
  @ApiQuery({ name: 'q', required: true, description: '검색어 (최소 2자 이상)' })
  @ApiOkResponse({
    description: '자동완성 성공',
    type: ApiSuccessResponseDto,
    schema: {
      example: {
        ok: true,
        status: 200,
        message: 'Request successful',
        data: [{ symbol: '005930', name_kr: '삼성전자', market: 'KR' }],
        meta: { requestId: 'req_01hqx8m3f', timestamp: '2026-03-06T09:10:00Z' }
      }
    }
  })
  @ApiBadRequestResponse({ description: '검색어는 최소 2자 이상', type: ApiErrorResponseDto })
  async autocomplete(@Query('q') query: string): Promise<InstrumentDto[]> {
    return this.instrumentsService.autocomplete(query);
  }

  @Get(':symbol')
  @ApiOperation({ summary: '종목 마스터 정보 조회' })
  @ApiParam({ name: 'symbol', description: '종목코드 또는 종목명' })
  @ApiOkResponse({
    description: '종목 마스터 조회 성공',
    type: ApiSuccessResponseDto,
    schema: {
      example: {
        ok: true,
        status: 200,
        message: 'Request successful',
        data: {
          symbol: '005930',
          name_kr: '삼성전자',
          market: 'KR',
          updated_at: '2026-03-06T09:10:00Z'
        },
        meta: { requestId: 'req_01hqx8m3f', timestamp: '2026-03-06T09:10:00Z' }
      }
    }
  })
  @ApiNotFoundResponse({ description: '종목을 찾을 수 없음', type: ApiErrorResponseDto })
  async getInstrument(@Param('symbol') symbol: string): Promise<InstrumentDetailDto> {
    return this.instrumentsService.getInstrument(symbol);
  }
}
