import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateWatchlistItemDto {
  @ApiProperty({ example: 'AAPL' })
  @IsString()
  @MaxLength(20)
  symbol!: string;
}
