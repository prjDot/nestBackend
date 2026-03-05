import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { StockAnalyzerService } from '../services/stock-analyzer.service';
import { StockAnalysisDto } from '../dto/analyze-stock.response.dto';
import { BatchAnalyzeResponseDto } from '../dto/batch-analyze.response.dto';

@ApiTags('Stocks')
@Controller('stocks')
export class StockAnalyzerController {
  constructor(private readonly stockAnalyzerService: StockAnalyzerService) {}

  @Get(':symbol')
  @ApiOperation({
    summary: '단일 종목 시세 조회',
    description: '한 종목의 현재가와 52주 대비 위치를 조회합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: 'AAPL (해외) / 005930 (국내) / 삼성전자 (한글)',
    example: 'AAPL'
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: '유저 아이디 (선택)'
  })
  @ApiOkResponse({
    description: '종목의 현재가와 52주 대비 위치 정보 반환',
    type: StockAnalysisDto,
    schema: {
      example: {
        ok: true,
        status: 200,
        message: 'AAPL 시세 및 위치 분석 완료',
        data: {
          symbol: 'AAPL',
          name_kr: '애플',
          market: 'US',
          price: 185.0,
          low_52w: 160.0,
          high_52w: 200.0,
          position_percent: 62.5,
          updated_at: '2026-03-05T08:40:21.000Z'
        },
        meta: {
          requestId: 'req_01hqx8m3f',
          timestamp: '2026-03-05T08:40:21.000Z'
        }
      }
    }
  })
  async analyzeStock(
    @Param('symbol') symbol: string,
    @Query('userId') userId?: string
  ): Promise<{ message: string; data: StockAnalysisDto }> {
    const targetUserId = userId || 'test_user_id';
    const data = await this.stockAnalyzerService.analyzeQuote(symbol, targetUserId);

    return {
      message: `${symbol.toUpperCase()} 시세 및 위치 분석 완료`,
      data
    };
  }

  @Get()
  @ApiOperation({
    summary: '다중 종목 일괄 조회',
    description: '여러 종목을 한 번에 조회합니다. 일부 실패해도 성공한 것은 모두 반환합니다.'
  })
  @ApiQuery({
    name: 'symbols',
    required: true,
    description: '종목 목록 (쉼표로 구분, 최대 50개)',
    example: 'AAPL,005930,카카오'
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: '유저 아이디 (선택)'
  })
  @ApiOkResponse({
    description: '다중 종목 조회 결과 (성공/실패 분류)',
    schema: {
      example: {
        ok: true,
        status: 200,
        message: '3개 종목 중 2개 조회 성공',
        data: {
          success: [
            {
              symbol: 'AAPL',
              name_kr: '애플',
              market: 'US',
              price: 185.0,
              low_52w: 160.0,
              high_52w: 200.0,
              position_percent: 62.5,
              updated_at: '2026-03-05T08:40:21.000Z'
            }
          ],
          failed: ['INVALID_SYMBOL'],
          total: 3,
          successCount: 2,
          failedCount: 1
        },
        meta: {
          requestId: 'req_01hqx8m3f',
          timestamp: '2026-03-05T08:40:21.000Z'
        }
      }
    }
  })
  async analyzeBatchQuery(
    @Query('symbols') symbolsQuery: string,
    @Query('userId') userId?: string
  ): Promise<{ message: string; data: BatchAnalyzeResponseDto }> {
    const symbols = symbolsQuery.split(',').map(s => s.trim()).filter(s => s.length > 0);

    if (symbols.length === 0) {
      throw new Error('최소 1개 이상의 종목을 입력해야 합니다.');
    }
    if (symbols.length > 50) {
      throw new Error('최대 50개까지만 조회할 수 있습니다.');
    }

    const targetUserId = userId || 'test_user_id';
    const result = await this.stockAnalyzerService.analyzeBatch(symbols, targetUserId);

    const responseData: BatchAnalyzeResponseDto = {
      success: result.success,
      failed: result.failed,
      total: symbols.length,
      successCount: result.success.length,
      failedCount: result.failed.length
    };

    return {
      message: `${symbols.length}개 종목 중 ${result.success.length}개 조회 성공`,
      data: responseData
    };
  }
}
