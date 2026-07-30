import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { PushService } from '../../infrastructure/push/push.service';
import { ReportsService } from '../reports/reports.service';
import { GdprService } from '../gdpr/gdpr.service';

@Processor('medication-reminders')
export class MedicationReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(MedicationReminderProcessor.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly push: PushService,
  ) {
    super();
  }

  async process(job: Job<{ userId: string; medicationId: string }>) {
    const med = await this.prisma.medication.findUnique({ where: { id: job.data.medicationId } });
    const user = await this.prisma.user.findUnique({ where: { id: job.data.userId } });
    if (!med || !user) return;
    const tokens = await this.prisma.devicePushToken.findMany({ where: { userId: user.id } });
    for (const t of tokens) {
      await this.push.send(t.token, 'Medication reminder', `Time for ${med.name}`);
    }
    await this.email.send(user.email, 'Luna medication reminder', `<p>Time to take <strong>${med.name}</strong>.</p>`);
    this.logger.log(`Reminded user ${user.id} for med ${med.id}`);
  }
}

@Processor('doctor-report')
export class DoctorReportProcessor extends WorkerHost {
  constructor(private readonly reports: ReportsService) {
    super();
  }
  async process(job: Job<{ reportId: string; userId: string }>) {
    await this.reports.generate(job.data.reportId, job.data.userId);
  }
}

@Processor('gdpr-export')
export class GdprExportProcessor extends WorkerHost {
  constructor(private readonly gdpr: GdprService) {
    super();
  }
  async process(job: Job<{ jobId: string; userId: string }>) {
    await this.gdpr.runExport(job.data.jobId, job.data.userId);
  }
}
