import { Injectable, NotFoundException } from '@nestjs/common';

export interface MarketData {
  symbol: string;       // 티커(해외) 또는 종목코드(국내)
  name_kr: string;      // 한글 종목명
  market: 'US' | 'KR';  // 시장 구분
  price: number;
  low_52w: number;
  high_52w: number;
}

@Injectable()
export class MockMarketDataService {
  // 배열 형태로 관리하여 검색을 용이하게 합니다.
  private mockDataList: MarketData[] = [
    // 🇺🇸 해외 주식 (US)
    { symbol: 'AAPL', name_kr: '애플', market: 'US', price: 185.0, low_52w: 160.0, high_52w: 200.0 },
    { symbol: 'TSLA', name_kr: '테슬라', market: 'US', price: 200.0, low_52w: 150.0, high_52w: 250.0 },
    { symbol: 'AMZN', name_kr: '아마존', market: 'US', price: 175.0, low_52w: 130.0, high_52w: 180.0 },
    { symbol: 'NVDA', name_kr: '엔비디아', market: 'US', price: 850.0, low_52w: 400.0, high_52w: 974.0 },
    { symbol: 'MSFT', name_kr: '마이크로소프트', market: 'US', price: 420.0, low_52w: 310.0, high_52w: 430.0 },
    { symbol: 'GOOGL', name_kr: '알파벳', market: 'US', price: 145.0, low_52w: 115.0, high_52w: 155.0 },
    { symbol: 'META', name_kr: '메타', market: 'US', price: 490.0, low_52w: 200.0, high_52w: 530.0 },
    { symbol: 'NFLX', name_kr: '넷플릭스', market: 'US', price: 600.0, low_52w: 350.0, high_52w: 630.0 },
    { symbol: 'AMD', name_kr: '에이엠디', market: 'US', price: 170.0, low_52w: 80.0, high_52w: 220.0 },
    { symbol: 'INTC', name_kr: '인텔', market: 'US', price: 45.0, low_52w: 25.0, high_52w: 50.0 },
    { symbol: 'QCOM', name_kr: '퀄컴', market: 'US', price: 160.0, low_52w: 105.0, high_52w: 175.0 },
    { symbol: 'BA', name_kr: '보잉', market: 'US', price: 190.0, low_52w: 170.0, high_52w: 260.0 },
    { symbol: 'DIS', name_kr: '디즈니', market: 'US', price: 110.0, low_52w: 78.0, high_52w: 123.0 },
    { symbol: 'UBER', name_kr: '우버', market: 'US', price: 75.0, low_52w: 30.0, high_52w: 82.0 },
    { symbol: 'COIN', name_kr: '코인베이스', market: 'US', price: 250.0, low_52w: 50.0, high_52w: 280.0 },

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

  async getQuote(searchQuery: string): Promise<MarketData> {
    const query = searchQuery.toUpperCase();
    
    // 심볼(코드), 한글명, 영문명 어디에든 포함되어 있으면 반환하게 다중 조건 검색
    const data = this.mockDataList.find(
      (stock) =>
        stock.symbol === query ||
        stock.name_kr.toUpperCase().includes(query)
    );

    if (!data) {
      throw new NotFoundException(`해당 종목을 찾을 수 없습니다: ${searchQuery}`);
    }
    
    // 네트워크 딜레이(지연) 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 300));
    return data;
  }
}

