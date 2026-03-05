import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAlertDto {
  @ApiPropertyOptional({ example: 'target', description: 'target | rise | fall | range' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  type?: string;

  @ApiPropertyOptional({ example: 70000 })
  @IsOptional()
  @IsNumber()
  targetPrice?: number;

  @ApiPropertyOptional({ example: 3.5 })
  @IsOptional()
  @IsNumber()
  changeRate?: number;

  @ApiPropertyOptional({ example: 65000 })
  @IsOptional()
  @IsNumber()
  rangeMin?: number;

  @ApiPropertyOptional({ example: 71000 })
  @IsOptional()
  @IsNumber()
  rangeMax?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
