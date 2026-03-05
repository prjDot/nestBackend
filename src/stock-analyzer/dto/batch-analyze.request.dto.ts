import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMaxSize, ArrayMinSize } from 'class-validator';

export class BatchAnalyzeRequestDto {
  @ApiProperty({
    example: ['AAPL', 'TSLA', '005930', '카카오'],
    description: '조회할 종목 코드/이름 배열 (최대 50개)',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: '최소 1개 이상의 종목을 입력해야 합니다.' })
  @ArrayMaxSize(50, { message: '최대 50개까지만 조회할 수 있습니다.' })
  symbols!: string[];
}
