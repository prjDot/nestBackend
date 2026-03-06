import { Injectable } from '@nestjs/common';
import { MockMarketDataService } from '../common/services/mock-market-data.service';
import { PricePositionDto } from './dto/price-position.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly mockMarketDataService: MockMarketDataService) {}

  async getPricePosition(symbol: string): Promise<PricePositionDto> {
    const data = this.mockMarketDataService.findBySymbol(symbol);
    
    // 52주 구간 내 현재 위치 계산 (0-100%)
    let positionPercent: number;
    if (data.high_52w === data.low_52w) {
      positionPercent = 50.0;
    } else {
      positionPercent = ((data.price - data.low_52w) / (data.high_52w - data.low_52w)) * 100;
      positionPercent = Math.max(0, Math.min(100, positionPercent));
      positionPercent = parseFloat(positionPercent.toFixed(2));
    }

    return {
      symbol: data.symbol,
      name_kr: data.name_kr,
      price: data.price,
      low_52w: data.low_52w,
      high_52w: data.high_52w,
      position_percent: positionPercent,
      updated_at: new Date().toISOString()
    };
  }
}
