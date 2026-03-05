import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
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
  @ApiOperation({
    summary: '디바이스 등록',
    description:
      '푸시 토큰과 플랫폼을 등록합니다. 같은 `deviceToken`이 이미 있으면 기존 레코드를 갱신합니다.'
  })
  @ApiCreatedResponse({
    description: '디바이스 등록 또는 갱신 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: '지원하지 않는 platform 또는 DTO 검증 실패',
    type: ApiErrorResponseDto
  })
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
  @ApiOperation({
    summary: '디바이스 상태 업데이트',
    description: '알림 허용 여부와 locale을 수정합니다.'
  })
  @ApiParam({
    name: 'deviceId',
    description: '등록된 디바이스 UUID'
  })
  @ApiOkResponse({
    description: '디바이스 업데이트 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'DTO 검증 실패',
    type: ApiErrorResponseDto
  })
  @ApiNotFoundResponse({
    description: '해당 사용자의 디바이스를 찾을 수 없음',
    type: ApiErrorResponseDto
  })
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
  @ApiOperation({
    summary: '디바이스 제거',
    description: '현재 사용자에게 연결된 디바이스를 제거합니다.'
  })
  @ApiParam({
    name: 'deviceId',
    description: '등록된 디바이스 UUID'
  })
  @ApiOkResponse({
    description: '디바이스 제거 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiNotFoundResponse({
    description: '해당 사용자의 디바이스를 찾을 수 없음',
    type: ApiErrorResponseDto
  })
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
