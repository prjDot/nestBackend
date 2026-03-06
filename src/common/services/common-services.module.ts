import { Module } from '@nestjs/common';
import { MockMarketDataService } from './mock-market-data.service';

@Module({
  providers: [MockMarketDataService],
  exports: [MockMarketDataService]
})
export class CommonServicesModule {}
