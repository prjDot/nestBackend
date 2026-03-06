import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { MockMarketDataService } from '../common/services/mock-market-data.service';
import { AppLoggerService } from '../common/logger/app-logger.service';

@Module({
  controllers: [QuotesController],
  providers: [QuotesService, MockMarketDataService, AppLoggerService],
  exports: [QuotesService]
})
export class QuotesModule {}
