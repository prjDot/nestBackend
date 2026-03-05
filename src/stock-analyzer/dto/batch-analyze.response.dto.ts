import { ApiProperty } from '@nestjs/swagger';
import { StockAnalysisDto } from './analyze-stock.response.dto';

export class BatchAnalyzeResponseDto {
  @ApiProperty({
    description: '성공적으로 조회된 종목 데이터',
    type: [StockAnalysisDto]
  })
  success!: StockAnalysisDto[];

  @ApiProperty({
    description: '조회 실패한 종목 목록',
    example: ['INVALID_SYMBOL', 'NOTFOUND'],
    type: [String]
  })
  failed!: string[];

  @ApiProperty({
    description: '총 조회 요청 수',
    example: 10
  })
  total!: number;

  @ApiProperty({
    description: '성공 개수',
    example: 8
  })
  successCount!: number;

  @ApiProperty({
    description: '실패 개수',
    example: 2
  })
  failedCount!: number;
}
