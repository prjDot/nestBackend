import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { BearerAuthGuard } from '../auth/guards/bearer-auth.guard';
import { ApiErrorResponseDto, ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@ApiTags('Alerts')
@ApiBearerAuth('bearer')
@UseGuards(BearerAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({
    summary: '가격 알림 생성',
    description:
      'type에 따라 필요한 필드가 달라집니다. target=targetPrice, rise/fall=changeRate, range=rangeMin/rangeMax'
  })
  @ApiCreatedResponse({
    description: '가격 알림 생성 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'DTO 검증 실패 또는 type별 필수 파라미터 누락',
    type: ApiErrorResponseDto
  })
  async create(
    @CurrentUserId() userId: string,
    @Body() body: CreateAlertDto
  ): Promise<{ message: string; data: unknown }> {
    const alert = await this.alertsService.create(userId, body);
    return {
      message: 'Alert created successfully',
      data: alert
    };
  }

  @Get()
  @ApiOperation({
    summary: '가격 알림 목록 조회',
    description: 'symbol, type, active 조건으로 필터링할 수 있습니다.'
  })
  @ApiQuery({
    name: 'symbol',
    required: false,
    description: '특정 심볼만 조회',
    example: '005930'
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '알림 타입 필터',
    schema: {
      type: 'string',
      enum: ['target', 'rise', 'fall', 'range']
    }
  })
  @ApiQuery({
    name: 'active',
    required: false,
    description: '활성화 여부 문자열 필터',
    schema: {
      type: 'string',
      enum: ['true', 'false']
    }
  })
  @ApiOkResponse({
    description: '가격 알림 목록 조회 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: '지원하지 않는 type 또는 active 값',
    type: ApiErrorResponseDto
  })
  async list(
    @CurrentUserId() userId: string,
    @Query('symbol') symbol?: string,
    @Query('type') type?: string,
    @Query('active') active?: string
  ): Promise<{ message: string; data: unknown }> {
    const alerts = await this.alertsService.list(userId, { symbol, type, active });
    return {
      message: 'Fetched alerts successfully',
      data: alerts
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: '가격 알림 수정',
    description: '기존 알림 타입을 변경하거나 조건값을 업데이트합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '가격 알림 UUID'
  })
  @ApiOkResponse({
    description: '가격 알림 수정 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: '지원하지 않는 type 또는 type별 필수 파라미터 누락',
    type: ApiErrorResponseDto
  })
  @ApiNotFoundResponse({
    description: '알림을 찾을 수 없음',
    type: ApiErrorResponseDto
  })
  async update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: UpdateAlertDto
  ): Promise<{ message: string; data: unknown }> {
    const alert = await this.alertsService.update(userId, id, body);
    return {
      message: 'Alert updated successfully',
      data: alert
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: '가격 알림 삭제',
    description: '알림 id 기준으로 삭제합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '가격 알림 UUID'
  })
  @ApiOkResponse({
    description: '가격 알림 삭제 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiNotFoundResponse({
    description: '알림을 찾을 수 없음',
    type: ApiErrorResponseDto
  })
  async remove(
    @CurrentUserId() userId: string,
    @Param('id') id: string
  ): Promise<{ message: string; data: null }> {
    await this.alertsService.remove(userId, id);
    return {
      message: 'Alert deleted successfully',
      data: null
    };
  }
}
