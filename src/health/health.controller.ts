import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags
} from '@nestjs/swagger';
import { ApiErrorResponseDto, ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  @ApiOperation({ summary: '헬스체크' })
  @ApiOkResponse({
    description: '서버 상태 확인',
    type: ApiSuccessResponseDto,
    schema: {
      example: {
        ok: true,
        status: 200,
        message: 'Health check successful',
        data: {
          service: 'cap3',
          uptimeSec: 120
        },
        meta: {
          requestId: 'req_01hqx8m3f',
          timestamp: '2026-03-05T08:40:21Z'
        }
      }
    }
  })
  health(): { message: string; data: { service: string; uptimeSec: number } } {
    return {
      message: 'Health check successful',
      data: {
        service: 'cap3',
        uptimeSec: Math.floor(process.uptime())
      }
    };
  }

  @Get('ready')
  @ApiOperation({ summary: '레디니스 체크 (DB 포함)' })
  @ApiOkResponse({
    description: 'DB를 포함한 서버 준비 상태 확인',
    type: ApiSuccessResponseDto
  })
  @ApiServiceUnavailableResponse({
    description: 'DB 연결 불가',
    type: ApiErrorResponseDto
  })
  async readiness(): Promise<{
    message: string;
    data: { service: string; uptimeSec: number; db: 'up' };
  }> {
    const isDbHealthy = await this.prismaService.isHealthy();
    if (!isDbHealthy) {
      throw new ServiceUnavailableException({
        code: 'DATABASE_UNAVAILABLE',
        message: '데이터베이스 준비 상태가 비정상입니다.',
        detail: null
      });
    }

    return {
      message: 'Readiness check successful',
      data: {
        service: 'cap3',
        uptimeSec: Math.floor(process.uptime()),
        db: 'up'
      }
    };
  }
}
