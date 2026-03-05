import { ApiProperty } from '@nestjs/swagger';

export class StockAnalysisDto {
  @ApiProperty({ example: 'AAPL', description: '주식 티커 (해외) 또는 종목코드 6자리 (국내)' })
  symbol!: string;

  @ApiProperty({ example: '애플', description: '종목명 (한글)' })
  name_kr!: string;

  @ApiProperty({ example: 'US', description: '시장 구분 (US: 미국, KR: 한국)' })
  market!: 'US' | 'KR';

  @ApiProperty({ example: 185.0, description: '현재가' })
  price!: number;

  @ApiProperty({ example: 160.0, description: '52주 최저가' })
  low_52w!: number;

  @ApiProperty({ example: 200.0, description: '52주 최고가' })
  high_52w!: number;

  @ApiProperty({ example: 62.5, description: '52주 최저가 대비 현재가 위치 (0~100%)' })
  position_percent!: number;

  @ApiProperty({ example: '2026-03-05T08:40:21.000Z', description: '업데이트 시간 (ISO 8601 UTC)' })
  updated_at!: string;
}
