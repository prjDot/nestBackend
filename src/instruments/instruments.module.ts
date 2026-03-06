import { Module } from '@nestjs/common';
import { CommonServicesModule } from '../common/services/common-services.module';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

@Module({
  imports: [CommonServicesModule],
  controllers: [InstrumentsController],
  providers: [InstrumentsService],
  exports: [InstrumentsService]
})
export class InstrumentsModule {}
