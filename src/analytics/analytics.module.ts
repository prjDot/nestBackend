import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { MockMarketDataService } from '../common/services/mock-market-data.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, MockMarketDataService],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
