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
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
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
  @ApiOperation({ summary: '가격 알림 생성' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
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
  @ApiOperation({ summary: '가격 알림 목록 조회' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
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
  @ApiOperation({ summary: '가격 알림 수정' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
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
  @ApiOperation({ summary: '가격 알림 삭제' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
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
