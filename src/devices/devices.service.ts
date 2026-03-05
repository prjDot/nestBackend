import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import type { Device, DevicePlatform } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateDeviceDto } from './dto/create-device.dto';
import type { UpdateDeviceDto } from './dto/update-device.dto';

interface DeviceResponse {
  id: string;
  deviceToken: string;
  platform: 'ios' | 'android' | 'web';
  notificationEnabled: boolean;
  locale: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class DevicesService {
  constructor(private readonly prismaService: PrismaService) {}

  async register(userId: string, payload: CreateDeviceDto): Promise<DeviceResponse> {
    const platform = toDevicePlatform(payload.platform);

    const device = await this.prismaService.device.upsert({
      where: {
        userId_deviceToken: {
          userId,
          deviceToken: payload.deviceToken
        }
      },
      create: {
        userId,
        deviceToken: payload.deviceToken,
        platform
      },
      update: {
        platform
      }
    });

    return toDeviceResponse(device);
  }

  async update(
    userId: string,
    deviceId: string,
    payload: UpdateDeviceDto
  ): Promise<DeviceResponse> {
    const updated = await this.prismaService.device.updateMany({
      where: {
        id: deviceId,
        userId
      },
      data: {
        notificationEnabled: payload.notificationEnabled,
        locale: payload.locale
      }
    });

    if (updated.count === 0) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: '디바이스를 찾을 수 없습니다',
        detail: null
      });
    }

    const device = await this.prismaService.device.findUnique({
      where: {
        id: deviceId
      }
    });

    if (!device) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: '디바이스를 찾을 수 없습니다',
        detail: null
      });
    }

    return toDeviceResponse(device);
  }

  async remove(userId: string, deviceId: string): Promise<void> {
    const deleted = await this.prismaService.device.deleteMany({
      where: {
        id: deviceId,
        userId
      }
    });

    if (deleted.count === 0) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: '디바이스를 찾을 수 없습니다',
        detail: null
      });
    }
  }
}

function toDevicePlatform(platform: string): DevicePlatform {
  const normalized = platform.trim().toUpperCase();

  if (normalized === 'IOS' || normalized === 'ANDROID' || normalized === 'WEB') {
    return normalized as DevicePlatform;
  }

  throw new BadRequestException({
    code: 'INVALID_REQUEST',
    message: '지원하지 않는 디바이스 플랫폼입니다',
    detail: {
      allowed: ['ios', 'android', 'web']
    }
  });
}

function toDeviceResponse(device: Device): DeviceResponse {
  return {
    id: device.id,
    deviceToken: device.deviceToken,
    platform: device.platform.toLowerCase() as DeviceResponse['platform'],
    notificationEnabled: device.notificationEnabled,
    locale: device.locale,
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString()
  };
}
