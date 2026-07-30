import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class MedicationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() @InjectQueue('medication-reminders') private readonly queue?: Queue,
  ) {}

  list(userId: string) {
    return this.prisma.medication.findMany({
      where: { userId },
      include: { schedules: true, doses: { take: 20, orderBy: { scheduledAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    userId: string,
    data: { name: string; dosage?: string; notes?: string; reminderTimes?: string[]; active?: boolean },
  ) {
    const med = await this.prisma.medication.create({
      data: {
        userId,
        name: data.name,
        dosage: data.dosage,
        notes: data.notes,
        active: data.active ?? true,
        schedules: {
          create: (data.reminderTimes ?? []).map((timeOfDay) => ({ timeOfDay })),
        },
      },
      include: { schedules: true },
    });

    if (this.queue) {
      for (const schedule of med.schedules) {
        const [h, m] = schedule.timeOfDay.split(':').map(Number);
        const job = await this.queue.add(
          'remind',
          { userId, medicationId: med.id, scheduleId: schedule.id },
          {
            repeat: { pattern: `${m ?? 0} ${h ?? 9} * * *` },
            jobId: `med-${schedule.id}`,
          },
        );
        await this.prisma.medicationSchedule.update({
          where: { id: schedule.id },
          data: { jobId: String(job.id) },
        });
      }
    }
    return med;
  }

  async remove(userId: string, id: string) {
    const med = await this.prisma.medication.findFirst({ where: { id, userId }, include: { schedules: true } });
    if (!med) throw new NotFoundException();
    if (this.queue) {
      for (const s of med.schedules) {
        if (s.jobId) {
          try {
            await this.queue.removeRepeatableByKey(s.jobId);
          } catch {
            /* ignore */
          }
        }
      }
    }
    await this.prisma.medication.delete({ where: { id } });
    return { ok: true };
  }

  async takeDose(userId: string, medicationId: string, date: string) {
    const med = await this.prisma.medication.findFirst({
      where: { id: medicationId, userId, active: true },
    });
    if (!med) throw new NotFoundException('Lek nije pronađen');

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const existing = await this.prisma.medicationDose.findFirst({
      where: {
        medicationId,
        takenAt: { not: null },
        scheduledAt: { gte: dayStart, lte: dayEnd },
      },
    });

    if (existing) return existing;

    return this.prisma.medicationDose.create({
      data: {
        medicationId,
        scheduledAt: new Date(`${date}T12:00:00.000Z`),
        takenAt: new Date(),
      },
    });
  }

  async untakeDose(userId: string, medicationId: string, date: string) {
    const med = await this.prisma.medication.findFirst({ where: { id: medicationId, userId } });
    if (!med) throw new NotFoundException();

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    await this.prisma.medicationDose.deleteMany({
      where: {
        medicationId,
        takenAt: { not: null },
        scheduledAt: { gte: dayStart, lte: dayEnd },
      },
    });
    return { ok: true };
  }
}
