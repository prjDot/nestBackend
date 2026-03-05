import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StockAnalyzerController } from '../controllers/stock-analyzer.controller';
import { StockAnalyzerService } from '../services/stock-analyzer.service';
import { MockMarketDataService } from '../mock/mock-market-data.service';

@Module({
  imports: [ConfigModule],
  controllers: [StockAnalyzerController],
  providers: [StockAnalyzerService, MockMarketDataService],
  exports: [StockAnalyzerService]
})
export class StockAnalyzerModule {}
