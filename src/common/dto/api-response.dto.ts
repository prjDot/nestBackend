import { ApiProperty } from '@nestjs/swagger';

export class ResponseMetaDto {
  @ApiProperty({ example: 'req_01hqx8m3f', description: '요청 식별자' })
  requestId!: string;

  @ApiProperty({
    example: '2026-03-05T08:40:21Z',
    description: 'ISO 8601 UTC 타임스탬프'
  })
  timestamp!: string;
}

export class ApiSuccessResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ example: 200 })
  status!: number;

  @ApiProperty({ example: 'Request successful' })
  message!: string;

  @ApiProperty({ example: {} })
  data!: unknown;

  @ApiProperty({ type: ResponseMetaDto })
  meta!: ResponseMetaDto;
}

export class ApiErrorDetailDto {
  @ApiProperty({ example: 'RESOURCE_NOT_FOUND' })
  code!: string;

  @ApiProperty({ example: '리소스를 찾을 수 없습니다' })
  message!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: null,
    description: '추가 에러 상세 정보'
  })
  detail!: unknown;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  ok!: boolean;

  @ApiProperty({ example: 404 })
  status!: number;

  @ApiProperty({ type: ApiErrorDetailDto })
  error!: ApiErrorDetailDto;

  @ApiProperty({ type: ResponseMetaDto })
  meta!: ResponseMetaDto;
}
