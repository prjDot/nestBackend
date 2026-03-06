import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { MockMarketDataService } from '../common/services/mock-market-data.service';
import { AppLoggerService } from '../common/logger/app-logger.service';
import { QuoteDto, BatchQuoteResponseDto } from './dto/quote.dto';

@Injectable()
export class QuotesService implements OnModuleDestroy {
  private redis: Redis | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly mockMarketDataService: MockMarketDataService,
    private readonly logger: AppLoggerService
  ) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null
      });

      this.redis.on('connect', () => {
        this.logger.info('Redis connected for Quotes');
      });

      this.redis.on('error', (error) => {
        this.logger.warn(`Redis unavailable. Using without cache. (${error.message})`);
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      await this.redis.quit();
    } catch {
      this.redis.disconnect();
    } finally {
      this.redis = null;
    }
  }

  async getQuote(symbol: string): Promise<QuoteDto> {
    const normalizedSymbol = symbol.trim();

    // 먼저 데이터 조회하여 정확한 심볼 얻기
    const data = this.mockMarketDataService.findBySymbol(normalizedSymbol);

    // Redis 캐시 확인 (정확한 심볼 코드로)
    if (this.redis) {
      const cachedQuote = await this.getCachedQuote(data.symbol);
      if (cachedQuote) {
        return cachedQuote;
      }
    }
    
    const quote: QuoteDto = {
      symbol: data.symbol,
      name_kr: data.name_kr,
      price: data.price,
      low_52w: data.low_52w,
      high_52w: data.high_52w,
      updated_at: new Date().toISOString()
    };

    // Redis에 저장 시도
    if (this.redis) {
      try {
        const redisKey = `quote:${data.symbol}`;
        await this.redis.hset(redisKey, {
          symbol: quote.symbol,
          name_kr: quote.name_kr,
          price: quote.price.toString(),
          low_52w: quote.low_52w.toString(),
          high_52w: quote.high_52w.toString(),
          updated_at: quote.updated_at
        });
        await this.redis.expire(redisKey, 60);
      } catch (err) {
        const error = err as Error;
        this.logger.warn(`Redis save failed: ${error.message}`);
      }
    }

    return quote;
  }

  private async getCachedQuote(symbol: string): Promise<QuoteDto | null> {
    if (!this.redis) {
      return null;
    }

    try {
      const redisKey = `quote:${symbol}`;
      const cached = await this.redis.hgetall(redisKey);
      if (!cached.symbol) {
        return null;
      }

      return {
        symbol: cached.symbol,
        name_kr: cached.name_kr,
        price: Number(cached.price),
        low_52w: Number(cached.low_52w),
        high_52w: Number(cached.high_52w),
        updated_at: cached.updated_at
      };
    } catch (err) {
      const error = err as Error;
      this.logger.warn(`Redis read failed: ${error.message}`);
      return null;
    }
  }

  async getBatchQuotes(symbols: string[]): Promise<BatchQuoteResponseDto> {
    const results = await Promise.allSettled(
      symbols.map((symbol) => this.getQuote(symbol))
    );

    const success: QuoteDto[] = [];
    const failed: Array<{ symbol: string; reason: string }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(result.value);
      } else {
        failed.push({
          symbol: symbols[index],
          reason: result.reason?.message || '알 수 없는 오류'
        });
      }
    });

    return { success, failed };
  }
}
