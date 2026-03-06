import { Injectable, NotFoundException } from '@nestjs/common';

export interface MarketData {
  symbol: string;       // 종목코드
  name_kr: string;      // 한글 종목명
  market: 'KR';         // 시장 구분 (국내만)
  price: number;
  low_52w: number;
  high_52w: number;
}

@Injectable()
export class MockMarketDataService {
  private mockDataList: MarketData[] = [
    // 🇰🇷 국내 주식 (KR)
    { symbol: '005930', name_kr: '삼성전자', market: 'KR', price: 73000, low_52w: 66000, high_52w: 86000 },
    { symbol: '000660', name_kr: 'SK하이닉스', market: 'KR', price: 175000, low_52w: 110000, high_52w: 185000 },
    { symbol: '373220', name_kr: 'LG에너지솔루션', market: 'KR', price: 410000, low_52w: 360000, high_52w: 620000 },
    { symbol: '035420', name_kr: '네이버', market: 'KR', price: 195000, low_52w: 180000, high_52w: 245000 },
    { symbol: '035720', name_kr: '카카오', market: 'KR', price: 54000, low_52w: 37000, high_52w: 62000 },
    { symbol: '005380', name_kr: '현대차', market: 'KR', price: 240000, low_52w: 170000, high_52w: 260000 },
    { symbol: '068270', name_kr: '셀트리온', market: 'KR', price: 180000, low_52w: 130000, high_52w: 240000 },
    { symbol: '000270', name_kr: '기아', market: 'KR', price: 115000, low_52w: 75000, high_52w: 125000 },
    { symbol: '051910', name_kr: 'LG화학', market: 'KR', price: 450000, low_52w: 400000, high_52w: 800000 },
    { symbol: '006400', name_kr: '삼성SDI', market: 'KR', price: 420000, low_52w: 350000, high_52w: 750000 },
    { symbol: '028260', name_kr: '삼성물산', market: 'KR', price: 155000, low_52w: 100000, high_52w: 170000 },
    { symbol: '012330', name_kr: '현대모비스', market: 'KR', price: 260000, low_52w: 200000, high_52w: 300000 },
    { symbol: '032830', name_kr: '삼성생명', market: 'KR', price: 90000, low_52w: 60000, high_52w: 105000 },
    { symbol: '105560', name_kr: 'KB금융', market: 'KR', price: 68000, low_52w: 45000, high_52w: 72000 },
    { symbol: '055550', name_kr: '신한지주', market: 'KR', price: 48000, low_52w: 32000, high_52w: 51000 }
  ];

  findBySymbol(searchQuery: string): MarketData {
    const query = searchQuery.toUpperCase().trim();
    
    const data = this.mockDataList.find(
      (stock) =>
        stock.symbol === query ||
        stock.name_kr.toUpperCase().includes(query)
    );

    if (!data) {
      throw new NotFoundException(`해당 종목을 찾을 수 없습니다: ${searchQuery}`);
    }
    
    return data;
  }

  findAll(): MarketData[] {
    return this.mockDataList;
  }

  search(query: string, limit: number = 10): MarketData[] {
    const searchQuery = query.toUpperCase().trim();
    
    return this.mockDataList
      .filter((stock) =>
        stock.symbol.includes(searchQuery) ||
        stock.name_kr.toUpperCase().includes(searchQuery)
      )
      .slice(0, limit);
  }
}
