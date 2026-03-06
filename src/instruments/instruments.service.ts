import { Injectable, BadRequestException } from '@nestjs/common';
import { MockMarketDataService } from '../common/services/mock-market-data.service';
import { InstrumentDto, InstrumentDetailDto } from './dto/instrument.dto';

@Injectable()
export class InstrumentsService {
  constructor(private readonly mockMarketDataService: MockMarketDataService) {}

  async search(query: string, limit: number = 10): Promise<InstrumentDto[]> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('검색어를 입력해주세요');
    }

    const results = this.mockMarketDataService.search(query, limit);
    return results.map((item) => ({
      symbol: item.symbol,
      name_kr: item.name_kr,
      market: item.market
    }));
  }

  async autocomplete(query: string): Promise<InstrumentDto[]> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('검색어는 최소 2자 이상이어야 합니다');
    }

    const results = this.mockMarketDataService.search(query, 10);
    return results.map((item) => ({
      symbol: item.symbol,
      name_kr: item.name_kr,
      market: item.market
    }));
  }

  async getInstrument(symbol: string): Promise<InstrumentDetailDto> {
    const data = this.mockMarketDataService.findBySymbol(symbol);
    
    return {
      symbol: data.symbol,
      name_kr: data.name_kr,
      market: data.market,
      updated_at: new Date().toISOString()
    };
  }
}
