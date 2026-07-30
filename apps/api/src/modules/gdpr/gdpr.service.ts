import { Injectable, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class GdprService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Optional() @InjectQueue('gdpr-export') private readonly queue?: Queue,
  ) {}

  async requestExport(userId: string) {
    const job = await this.prisma.gdprExportJob.create({ data: { userId, status: 'pending' } });
    if (this.queue) {
      await this.queue.add('export', { jobId: job.id, userId });
    } else {
      await this.runExport(job.id, userId);
    }
    await this.audit.log({ userId, action: 'EXPORT', resource: 'gdpr', resourceId: job.id });
    return job;
  }

  async runExport(jobId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        cycles: true,
        symptomLogs: true,
        moodLogs: true,
        weightLogs: true,
        sleepLogs: true,
        waterLogs: true,
        medications: true,
        fertilitySigns: true,
        intimacyLogs: true,
        notes: true,
        pregnancyProfile: { include: { checkIns: true } },
        consents: true,
      },
    });
    const dir = join(process.cwd(), 'uploads', 'gdpr');
    await mkdir(dir, { recursive: true });
    const path = join(dir, `${jobId}.json`);
    const { passwordHash: _, ...safe } = user ?? ({} as { passwordHash?: string });
    await writeFile(path, JSON.stringify(safe, null, 2));
    return this.prisma.gdprExportJob.update({
      where: { id: jobId },
      data: { status: 'ready', storagePath: path, completedAt: new Date() },
    });
  }

  async deleteAccount(userId: string) {
    const anon = `deleted+${userId}@luna.invalid`;
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: anon,
        displayName: 'Deleted User',
        passwordHash: 'deleted',
        deletedAt: new Date(),
        anonymizedAt: new Date(),
      },
    });
    await this.audit.log({ userId, action: 'ACCOUNT_DELETE', resource: 'user', resourceId: userId });
    return { ok: true };
  }

  listExports(userId: string) {
    return this.prisma.gdprExportJob.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}
