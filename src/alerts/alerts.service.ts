import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import type { AlertType, PriceAlert, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateAlertDto } from './dto/create-alert.dto';
import type { UpdateAlertDto } from './dto/update-alert.dto';

interface AlertResponse {
  id: string;
  symbol: string;
  type: 'target' | 'rise' | 'fall' | 'range';
  targetPrice: number | null;
  changeRate: number | null;
  rangeMin: number | null;
  rangeMax: number | null;
  isActive: boolean;
  triggerCount: number;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class AlertsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, payload: CreateAlertDto): Promise<AlertResponse> {
    const data = buildAlertData(payload);

    const created = await this.prismaService.priceAlert.create({
      data: {
        userId,
        symbol: payload.symbol,
        alertType: data.alertType,
        targetPrice: data.targetPrice,
        changeRate: data.changeRate,
        rangeMin: data.rangeMin,
        rangeMax: data.rangeMax,
        isActive: payload.isActive ?? true
      }
    });

    return toAlertResponse(created);
  }

  async list(
    userId: string,
    filters: { symbol?: string; type?: string; active?: string }
  ): Promise<AlertResponse[]> {
    const where: Prisma.PriceAlertWhereInput = {
      userId
    };

    if (filters.symbol) {
      where.symbol = filters.symbol;
    }

    if (filters.type) {
      where.alertType = toAlertType(filters.type);
    }

    if (filters.active !== undefined) {
      if (filters.active === 'true') {
        where.isActive = true;
      } else if (filters.active === 'false') {
        where.isActive = false;
      } else {
        throw new BadRequestException({
          code: 'INVALID_REQUEST',
          message: 'active 파라미터는 true 또는 false 이어야 합니다',
          detail: null
        });
      }
    }

    const alerts = await this.prismaService.priceAlert.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return alerts.map(toAlertResponse);
  }

  async update(userId: string, alertId: string, payload: UpdateAlertDto): Promise<AlertResponse> {
    const existing = await this.prismaService.priceAlert.findFirst({
      where: {
        id: alertId,
        userId
      }
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: '알림을 찾을 수 없습니다',
        detail: null
      });
    }

    const source = {
      type: payload.type ?? existing.alertType.toLowerCase(),
      targetPrice: payload.targetPrice ?? toNullableNumber(existing.targetPrice),
      changeRate: payload.changeRate ?? toNullableNumber(existing.changeRate),
      rangeMin: payload.rangeMin ?? toNullableNumber(existing.rangeMin),
      rangeMax: payload.rangeMax ?? toNullableNumber(existing.rangeMax)
    };

    const normalized = buildAlertData(source);

    const updated = await this.prismaService.priceAlert.update({
      where: {
        id: alertId
      },
      data: {
        alertType: normalized.alertType,
        targetPrice: normalized.targetPrice,
        changeRate: normalized.changeRate,
        rangeMin: normalized.rangeMin,
        rangeMax: normalized.rangeMax,
        isActive: payload.isActive ?? existing.isActive
      }
    });

    return toAlertResponse(updated);
  }

  async remove(userId: string, alertId: string): Promise<void> {
    const deleted = await this.prismaService.priceAlert.deleteMany({
      where: {
        id: alertId,
        userId
      }
    });

    if (deleted.count === 0) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: '알림을 찾을 수 없습니다',
        detail: null
      });
    }
  }
}

function buildAlertData(payload: {
  type: string;
  targetPrice?: number | null;
  changeRate?: number | null;
  rangeMin?: number | null;
  rangeMax?: number | null;
}): {
  alertType: AlertType;
  targetPrice: number | null;
  changeRate: number | null;
  rangeMin: number | null;
  rangeMax: number | null;
} {
  const alertType = toAlertType(payload.type);
  const targetPrice = payload.targetPrice ?? null;
  const changeRate = payload.changeRate ?? null;
  const rangeMin = payload.rangeMin ?? null;
  const rangeMax = payload.rangeMax ?? null;

  if (alertType === 'TARGET') {
    if (targetPrice === null) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'target 타입은 targetPrice가 필요합니다',
        detail: null
      });
    }

    return {
      alertType,
      targetPrice,
      changeRate: null,
      rangeMin: null,
      rangeMax: null
    };
  }

  if (alertType === 'RISE' || alertType === 'FALL') {
    if (changeRate === null) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'rise/fall 타입은 changeRate가 필요합니다',
        detail: null
      });
    }

    return {
      alertType,
      targetPrice: null,
      changeRate,
      rangeMin: null,
      rangeMax: null
    };
  }

  if (rangeMin === null || rangeMax === null || rangeMin >= rangeMax) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'range 타입은 rangeMin/rangeMax가 필요하며 rangeMin < rangeMax 여야 합니다',
      detail: null
    });
  }

  return {
    alertType,
    targetPrice: null,
    changeRate: null,
    rangeMin,
    rangeMax
  };
}

function toAlertType(type: string): AlertType {
  const normalized = type.trim().toUpperCase();

  if (
    normalized === 'TARGET' ||
    normalized === 'RISE' ||
    normalized === 'FALL' ||
    normalized === 'RANGE'
  ) {
    return normalized;
  }

  throw new BadRequestException({
    code: 'VALIDATION_ERROR',
    message: '지원하지 않는 알림 타입입니다',
    detail: {
      allowed: ['target', 'rise', 'fall', 'range']
    }
  });
}

function toAlertResponse(alert: PriceAlert): AlertResponse {
  return {
    id: alert.id,
    symbol: alert.symbol,
    type: alert.alertType.toLowerCase() as AlertResponse['type'],
    targetPrice: toNullableNumber(alert.targetPrice),
    changeRate: toNullableNumber(alert.changeRate),
    rangeMin: toNullableNumber(alert.rangeMin),
    rangeMax: toNullableNumber(alert.rangeMax),
    isActive: alert.isActive,
    triggerCount: alert.triggerCount,
    lastTriggeredAt: alert.lastTriggeredAt ? alert.lastTriggeredAt.toISOString() : null,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString()
  };
}

function toNullableNumber(value: { toNumber: () => number } | null): number | null {
  if (!value) {
    return null;
  }

  return value.toNumber();
}
