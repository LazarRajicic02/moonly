import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MedicationsService } from './medications.service';
import { MedicationsController } from './medications.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'medication-reminders' })],
  controllers: [MedicationsController],
  providers: [MedicationsService],
  exports: [MedicationsService],
})
export class MedicationsModule {}
