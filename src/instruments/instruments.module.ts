import { Module } from '@nestjs/common';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';
import { MockMarketDataService } from '../common/services/mock-market-data.service';

@Module({
  controllers: [InstrumentsController],
  providers: [InstrumentsService, MockMarketDataService],
  exports: [InstrumentsService]
})
export class InstrumentsModule {}
