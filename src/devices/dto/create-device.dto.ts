import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ example: 'fcm-token-abc' })
  @IsString()
  @MaxLength(1000)
  deviceToken!: string;

  @ApiProperty({ example: 'ios', description: 'ios | android | web' })
  @IsString()
  @MaxLength(20)
  platform!: string;
}
