import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import type { Prisma, WatchlistItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateWatchlistItemDto } from './dto/create-watchlist-item.dto';

interface WatchlistItemResponse {
  id: string;
  symbol: string;
  addedAt: string;
  customOrder: number | null;
}

@Injectable()
export class WatchlistService {
  constructor(private readonly prismaService: PrismaService) {}

  async add(userId: string, payload: CreateWatchlistItemDto): Promise<WatchlistItemResponse> {
    const currentCount = await this.prismaService.watchlistItem.count({
      where: { userId }
    });

    if (currentCount >= 50) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: '관심 종목은 최대 50개까지 등록할 수 있습니다',
        detail: {
          max: 50
        }
      });
    }

    try {
      const item = await this.prismaService.watchlistItem.create({
        data: {
          userId,
          symbol: payload.symbol
        }
      });

      return toWatchlistItemResponse(item);
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        throw new ConflictException({
          code: 'CONFLICT',
          message: '이미 관심 종목에 등록된 심볼입니다',
          detail: null
        });
      }

      throw error;
    }
  }

  async list(
    userId: string,
    sort: string | undefined,
    order: string | undefined
  ): Promise<WatchlistItemResponse[]> {
    if (sort && sort !== 'added') {
      throw new BadRequestException({
        code: 'INVALID_REQUEST',
        message: '현재 sort=added만 지원합니다',
        detail: {
          unsupportedSort: sort,
          reason: 'price/change 정렬은 외부 시세 API 연동 후 지원됩니다.'
        }
      });
    }

    const direction: Prisma.SortOrder = order?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const items = await this.prismaService.watchlistItem.findMany({
      where: { userId },
      orderBy: {
        addedAt: direction
      }
    });

    return items.map(toWatchlistItemResponse);
  }

  async remove(userId: string, symbol: string): Promise<void> {
    const deleted = await this.prismaService.watchlistItem.deleteMany({
      where: {
        userId,
        symbol
      }
    });

    if (deleted.count === 0) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: '관심 종목을 찾을 수 없습니다',
        detail: null
      });
    }
  }
}

function toWatchlistItemResponse(item: WatchlistItem): WatchlistItemResponse {
  return {
    id: item.id,
    symbol: item.symbol,
    addedAt: item.addedAt.toISOString(),
    customOrder: item.customOrder
  };
}

function isPrismaUniqueError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && code === 'P2002';
}
