import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
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
import { QuotesService } from './quotes.service';
import { QuoteDto, BatchQuoteResponseDto } from './dto/quote.dto';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get(':symbol')
  @ApiOperation({ summary: '종목 시세 조회' })
  @ApiParam({ name: 'symbol', description: '종목코드 또는 종목명' })
  @ApiOkResponse({
    description: '종목 시세 조회 성공',
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
          updated_at: '2026-03-06T09:10:00Z'
        },
        meta: { requestId: 'req_01hqx8m3f', timestamp: '2026-03-06T09:10:00Z' }
      }
    }
  })
  @ApiNotFoundResponse({ description: '종목을 찾을 수 없음', type: ApiErrorResponseDto })
  async getQuote(@Param('symbol') symbol: string): Promise<QuoteDto> {
    return this.quotesService.getQuote(symbol);
  }

  @Get()
  @ApiOperation({ summary: '여러 종목 시세 일괄 조회' })
  @ApiQuery({ name: 'symbols', description: '종목코드 또는 종목명 (쉼표로 구분, 최대 50개)' })
  @ApiOkResponse({
    description: '다중 종목 시세 조회 성공',
    type: ApiSuccessResponseDto,
    schema: {
      example: {
        ok: true,
        status: 200,
        message: 'Request successful',
        data: {
          success: [
            {
              symbol: '005930',
              name_kr: '삼성전자',
              price: 73000,
              low_52w: 66000,
              high_52w: 86000,
              updated_at: '2026-03-06T09:10:00Z'
            }
          ],
          failed: [{ symbol: 'NOTFOUND', reason: '해당 종목을 찾을 수 없습니다: NOTFOUND' }]
        },
        meta: { requestId: 'req_01hqx8m3f', timestamp: '2026-03-06T09:10:00Z' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'symbols 파라미터 오류', type: ApiErrorResponseDto })
  async getBatchQuotes(@Query('symbols') symbols: string): Promise<{ message: string; data: BatchQuoteResponseDto }> {
    if (!symbols) {
      throw new BadRequestException('symbols 파라미터가 필요합니다');
    }

    const symbolArray = symbols.split(',').map(s => s.trim()).filter(s => s.length > 0);

    if (symbolArray.length === 0) {
      throw new BadRequestException('최소 1개 이상의 종목이 필요합니다');
    }

    if (symbolArray.length > 50) {
      throw new BadRequestException('최대 50개까지 조회 가능합니다');
    }

    const data = await this.quotesService.getBatchQuotes(symbolArray);
    return { message: 'Batch quotes retrieved successfully', data };
  }
}
