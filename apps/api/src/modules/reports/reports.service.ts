import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { join } from 'path';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PdfService } from '../../infrastructure/pdf/pdf.service';
import { StatsService } from '../stats/stats.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: PdfService,
    private readonly stats: StatsService,
    @Optional() @InjectQueue('doctor-report') private readonly queue?: Queue,
  ) {}

  list(userId: string) {
    return this.prisma.doctorReport.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async create(userId: string, data: { title?: string; from: string; to: string }) {
    const report = await this.prisma.doctorReport.create({
      data: {
        userId,
        title: data.title ?? 'Doctor report',
        fromDate: new Date(`${data.from}T00:00:00.000Z`),
        toDate: new Date(`${data.to}T00:00:00.000Z`),
        status: 'pending',
      },
    });
    if (this.queue) {
      await this.queue.add('generate', { reportId: report.id, userId });
    } else {
      await this.generate(report.id, userId);
    }
    return report;
  }

  async generate(reportId: string, userId: string) {
    const report = await this.prisma.doctorReport.findFirst({ where: { id: reportId, userId } });
    if (!report) throw new NotFoundException();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const overview = await this.stats.overview(userId);
    const filePath = join(this.pdf.reportsDir(), `${reportId}.pdf`);
    try {
      await this.pdf.createDoctorReport({
        filePath,
        title: report.title,
        patientName: user?.displayName ?? 'Patient',
        from: report.fromDate.toISOString().slice(0, 10),
        to: report.toDate.toISOString().slice(0, 10),
        summary: overview as unknown as Record<string, unknown>,
      });
      return this.prisma.doctorReport.update({
        where: { id: reportId },
        data: { status: 'ready', storagePath: filePath, completedAt: new Date() },
      });
    } catch (e) {
      return this.prisma.doctorReport.update({
        where: { id: reportId },
        data: { status: 'failed', error: e instanceof Error ? e.message : 'error' },
      });
    }
  }

  async getFile(userId: string, id: string) {
    const report = await this.prisma.doctorReport.findFirst({ where: { id, userId } });
    if (!report || report.status !== 'ready' || !report.storagePath) {
      throw new NotFoundException('Report not ready');
    }
    return report;
  }
}
