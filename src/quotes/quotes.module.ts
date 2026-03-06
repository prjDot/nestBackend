import { Module } from '@nestjs/common';
import { CommonServicesModule } from '../common/services/common-services.module';
import { AppLoggerService } from '../common/logger/app-logger.service';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  imports: [CommonServicesModule],
  controllers: [QuotesController],
  providers: [QuotesService, AppLoggerService],
  exports: [QuotesService]
})
export class QuotesModule {}
