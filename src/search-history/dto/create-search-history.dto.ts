import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSearchHistoryDto {
  @ApiProperty({ example: '005930' })
  @IsString()
  @MaxLength(20)
  symbol!: string;

  @ApiPropertyOptional({ example: '삼성전자' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  query?: string;
}
