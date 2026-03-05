import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppLoggerService } from './common/logger/app-logger.service';
import { HealthController } from './health/health.controller';
import { StockAnalyzerModule } from './stock-analyzer/modules/stock-analyzer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    StockAnalyzerModule
  ],
  controllers: [HealthController],
  providers: [AppLoggerService]
})
export class AppModule {}
