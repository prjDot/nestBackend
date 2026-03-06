import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDeviceDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  notificationEnabled?: boolean;

  @ApiPropertyOptional({ example: 'ko-KR' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  locale?: string;
}
