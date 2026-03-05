import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
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
}
