import { ApiProperty } from '@nestjs/swagger';

export class QuoteDto {
  @ApiProperty({ example: '005930', description: '종목코드' })
  symbol!: string;

  @ApiProperty({ example: '삼성전자', description: '종목명' })
  name_kr!: string;

  @ApiProperty({ example: 73000, description: '현재가' })
  price!: number;

  @ApiProperty({ example: 66000, description: '52주 최저가' })
  low_52w!: number;

  @ApiProperty({ example: 86000, description: '52주 최고가' })
  high_52w!: number;

  @ApiProperty({ example: '2026-03-06T00:00:00.000Z' })
  updated_at!: string;
}

export class BatchQuoteRequestDto {
  @ApiProperty({ 
    example: '005930,000660,카카오', 
    description: '종목코드 또는 종목명 (쉼표로 구분, 최대 50개)' 
  })
  symbols!: string;
}

export class BatchQuoteResponseDto {
  @ApiProperty({ type: [QuoteDto] })
  success!: QuoteDto[];

  @ApiProperty({ 
    type: 'array',
    items: { 
      type: 'object',
      properties: {
        symbol: { type: 'string' },
        reason: { type: 'string' }
      }
    }
  })
  failed!: Array<{ symbol: string; reason: string }>;
}
