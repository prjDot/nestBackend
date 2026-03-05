import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
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
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesService } from './devices.service';

@ApiTags('Devices')
@ApiBearerAuth('bearer')
@UseGuards(BearerAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: '디바이스 등록' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async create(
    @CurrentUserId() userId: string,
    @Body() body: CreateDeviceDto
  ): Promise<{ message: string; data: unknown }> {
    const device = await this.devicesService.register(userId, body);
    return {
      message: 'Device registered successfully',
      data: device
    };
  }

  @Patch(':deviceId')
  @ApiOperation({ summary: '디바이스 상태 업데이트' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async update(
    @CurrentUserId() userId: string,
    @Param('deviceId') deviceId: string,
    @Body() body: UpdateDeviceDto
  ): Promise<{ message: string; data: unknown }> {
    const device = await this.devicesService.update(userId, deviceId, body);
    return {
      message: 'Device updated successfully',
      data: device
    };
  }

  @Delete(':deviceId')
  @ApiOperation({ summary: '디바이스 제거' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async remove(
    @CurrentUserId() userId: string,
    @Param('deviceId') deviceId: string
  ): Promise<{ message: string; data: null }> {
    await this.devicesService.remove(userId, deviceId);
    return {
      message: 'Device removed successfully',
      data: null
    };
  }
}
