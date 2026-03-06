import { ApiProperty } from '@nestjs/swagger';

export class InstrumentDto {
  @ApiProperty({ example: '005930', description: '종목코드' })
  symbol!: string;

  @ApiProperty({ example: '삼성전자', description: '종목명' })
  name_kr!: string;

  @ApiProperty({ example: 'KR', description: '시장 구분' })
  market!: string;
}

export class InstrumentDetailDto extends InstrumentDto {
  @ApiProperty({ example: '2026-03-06T00:00:00.000Z' })
  updated_at!: string;
}
