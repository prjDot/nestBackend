import { Injectable, NotFoundException } from '@nestjs/common';
import type { SearchHistory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSearchHistoryDto } from './dto/create-search-history.dto';

interface SearchHistoryItem {
  id: string;
  symbol: string;
  query: string | null;
  createdAt: string;
}

@Injectable()
export class SearchHistoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(userId: string, limit = 10): Promise<SearchHistoryItem[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const items = await this.prismaService.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: safeLimit
    });

    return items.map(toSearchHistoryItem);
  }

  async add(userId: string, payload: CreateSearchHistoryDto): Promise<SearchHistoryItem> {
    const created = await this.prismaService.searchHistory.create({
      data: {
        userId,
        symbol: payload.symbol,
        query: payload.query ?? null
      }
    });

    await this.trimToMax(userId, 10);

    return toSearchHistoryItem(created);
  }

  async remove(userId: string, id: string): Promise<void> {
    const deleted = await this.prismaService.searchHistory.deleteMany({
      where: {
        id,
        userId
      }
    });

    if (deleted.count === 0) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: '검색 기록을 찾을 수 없습니다',
        detail: null
      });
    }
  }

  async clear(userId: string): Promise<void> {
    await this.prismaService.searchHistory.deleteMany({
      where: {
        userId
      }
    });
  }

  private async trimToMax(userId: string, maxCount: number): Promise<void> {
    const staleItems = await this.prismaService.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: maxCount,
      select: { id: true }
    });

    if (staleItems.length === 0) {
      return;
    }

    await this.prismaService.searchHistory.deleteMany({
      where: {
        id: {
          in: staleItems.map((item) => item.id)
        }
      }
    });
  }
}

function toSearchHistoryItem(item: SearchHistory): SearchHistoryItem {
  return {
    id: item.id,
    symbol: item.symbol,
    query: item.query,
    createdAt: item.createdAt.toISOString()
  };
}
