import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { buildRedisKey } from '../constants/redis-keys';
import { MockMarketDataService } from '../mock/mock-market-data.service';
import { StockAnalysisDto } from '../dto/analyze-stock.response.dto';

@Injectable()
export class StockAnalyzerService {
  private readonly redis: Redis;
  private readonly logger = new Logger(StockAnalyzerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mockMarketDataService: MockMarketDataService
  ) {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    // 안정성을 위해 retry 전략 설정
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          return null; // 재시도 중단
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: false, // 에러를 즉시 잡기 위함
    });

    this.redis.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });
  }

  /**
   * 위치(%) 계산 공식: (Current - Low) / (High - Low) * 100
   */
  private calculatePositionPercent(price: number, low: number, high: number): number {
    if (high === low) return 0;
    const position = ((price - low) / (high - low)) * 100;
    return Math.max(0, Math.min(100, Number(position.toFixed(2)))); // 0에서 100 사이로 clamp 후 소수점 2자리 제한
  }

  async analyzeQuote(symbol: string, userId: string = 'test_user_id'): Promise<StockAnalysisDto> {
    this.logger.debug(`[User: ${userId}] Analyzing quote for ${symbol}`);
    
    // 1. 시세 데이터 확보 (현재는 Mock 서버 이용)
    const marketData = await this.mockMarketDataService.getQuote(symbol);

    // 2. 52주 데이터 기반 현재 위치(%) 계산
    const positionPercent = this.calculatePositionPercent(
      marketData.price,
      marketData.low_52w,
      marketData.high_52w
    );

    const now = new Date().toISOString();

    const analysisData: StockAnalysisDto = {
      symbol: marketData.symbol,
      name_kr: marketData.name_kr,
      market: marketData.market,
      price: marketData.price,
      low_52w: marketData.low_52w,
      high_52w: marketData.high_52w,
      position_percent: positionPercent,
      updated_at: now
    };

    // 3. Redis에 공유 캐싱 저장 (Hash 타입 사용)
    const redisKey = buildRedisKey.quote(symbol);
    
    try {
      // flat() 대신 Object.entries로 풀기
      const payload = Object.entries(analysisData).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>);

      await this.redis.hmset(redisKey, payload);
      await this.redis.expire(redisKey, 60); // 1분간 유효 (가이드라인: 1분 단위 업데이트 가능성)
    } catch (err) {
      // 가이드라인: Redis 연결 실패 시 프로세스가 중단되지 않도록 try-catch 구현.
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to save quote to Redis for ${symbol}: ${errMsg}`);
      
      // Redis 연결 실패 시 프로세스를 중단시키지 않고(에러를 냅다 던져 500에러를 만들지 않고),
      // 계산된 데이터를 그대로 반환(Fallback)하도록 수정합니다. (실제 서비스에서는 캐시 없이 응답)
      this.logger.warn('Redis is unavailable. Returning analysis data directly without caching.');
    }

    return analysisData;
  }

  /**
   * 다중 종목 일괄 조회 (병렬 처리로 효율 극대화)
   */
  async analyzeBatch(
    symbols: string[],
    userId: string = 'test_user_id'
  ): Promise<{ success: StockAnalysisDto[]; failed: string[] }> {
    this.logger.debug(`[User: ${userId}] Batch analyzing ${symbols.length} quotes`);

    // Promise.allSettled로 병렬 처리 (하나가 실패해도 나머지는 계속 진행)
    const results = await Promise.allSettled(
      symbols.map((symbol) => this.analyzeQuote(symbol, userId))
    );

    const success: StockAnalysisDto[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(result.value);
      } else {
        failed.push(symbols[index]);
        this.logger.warn(`Failed to analyze ${symbols[index]}: ${result.reason?.message}`);
      }
    });

    return { success, failed };
  }
}
