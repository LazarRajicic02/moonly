import { Module } from '@nestjs/common';
import { CycleService } from './application/cycle.service';
import { CycleController } from './presentation/cycle.controller';
import { CyclePredictionDomainService } from './domain/cycle-prediction.service';

@Module({
  controllers: [CycleController],
  providers: [CycleService, CyclePredictionDomainService],
  exports: [CycleService],
})
export class CycleModule {}
