import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface MyStats {
  watchlistCount: number;
  alertCount: number;
  recentSymbols: string[];
  alertTriggerCount: number;
}

@Injectable()
export class StatsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMyStats(userId: string): Promise<MyStats> {
    const [watchlistCount, alertCount, recentHistory, alertTriggerAggregation] =
      await this.prismaService.$transaction([
        this.prismaService.watchlistItem.count({ where: { userId } }),
        this.prismaService.priceAlert.count({ where: { userId } }),
        this.prismaService.searchHistory.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { symbol: true }
        }),
        this.prismaService.priceAlert.aggregate({
          where: { userId },
          _sum: {
            triggerCount: true
          }
        })
      ]);

    return {
      watchlistCount,
      alertCount,
      recentSymbols: recentHistory.map((item) => item.symbol),
      alertTriggerCount: alertTriggerAggregation._sum.triggerCount ?? 0
    };
  }
}
