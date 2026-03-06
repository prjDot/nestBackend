import { ApiProperty } from '@nestjs/swagger';

export class PricePositionDto {
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

  @ApiProperty({ 
    example: 35.0, 
    description: '52주 구간 내 위치 (0-100%)' 
  })
    position_percent!: number;

  @ApiProperty({ example: '2026-03-06T00:00:00.000Z' })
    updated_at!: string;
}
