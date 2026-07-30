import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  MedicationReminderProcessor,
  DoctorReportProcessor,
  GdprExportProcessor,
} from './processors';
import { ReportsModule } from '../reports/reports.module';
import { GdprModule } from '../gdpr/gdpr.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'medication-reminders' },
      { name: 'doctor-report' },
      { name: 'gdpr-export' },
      { name: 'cycle-prediction' },
    ),
    ReportsModule,
    GdprModule,
  ],
  providers: [MedicationReminderProcessor, DoctorReportProcessor, GdprExportProcessor],
})
export class JobsModule {}
