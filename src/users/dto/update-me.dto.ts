import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

const THEME_VALUES = ['system', 'light', 'dark'] as const;

export class UpdateMeDto {
  @ApiPropertyOptional({ example: '홍길동' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '길동이' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.png' })
  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  picture?: string;

  @ApiPropertyOptional({ example: 'ko-KR' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  locale?: string;

  @ApiPropertyOptional({ enum: THEME_VALUES, example: 'system' })
  @IsOptional()
  @IsIn(THEME_VALUES)
  theme?: (typeof THEME_VALUES)[number];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  notificationEnabled?: boolean;
}
