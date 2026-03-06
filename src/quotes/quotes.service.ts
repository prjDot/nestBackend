import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { MockMarketDataService } from '../common/services/mock-market-data.service';
import { AppLoggerService } from '../common/logger/app-logger.service';
import { QuoteDto, BatchQuoteResponseDto } from './dto/quote.dto';

@Injectable()
export class QuotesService {
  private redis: Redis | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly mockMarketDataService: MockMarketDataService,
    private readonly logger: AppLoggerService
  ) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          retryStrategy: () => null
        });

        this.redis.on('connect', () => {
          this.logger.log('Redis connected for Quotes');
        });

        this.redis.on('error', (error) => {
          this.logger.warn(`Redis unavailable. Using without cache. (${error.message})`);
        });
      } catch (err) {
        this.logger.warn('Redis connection failed. Using without cache.');
      }
    }
  }

  async getQuote(symbol: string): Promise<QuoteDto> {
    const data = this.mockMarketDataService.findBySymbol(symbol);
    
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
        await this.redis.hmset(redisKey, {
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
