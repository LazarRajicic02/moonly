import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getRange(userId: string, from: string, to: string) {
    const fromD = new Date(`${from}T00:00:00.000Z`);
    const toD = new Date(`${to}T00:00:00.000Z`);
    const [periodDays, symptoms, moods, prediction, weight, sleep, water, intimacy, notes, medications, medicationDoses] =
      await Promise.all([
        this.prisma.periodDay.findMany({ where: { userId, date: { gte: fromD, lte: toD } } }),
        this.prisma.symptomLog.findMany({ where: { userId, date: { gte: fromD, lte: toD } } }),
        this.prisma.moodLog.findMany({ where: { userId, date: { gte: fromD, lte: toD } } }),
        this.prisma.cyclePrediction.findFirst({
          where: { userId },
          orderBy: { computedAt: 'desc' },
        }),
        this.prisma.weightLog.findMany({ where: { userId, date: { gte: fromD, lte: toD } } }),
        this.prisma.sleepLog.findMany({ where: { userId, date: { gte: fromD, lte: toD } } }),
        this.prisma.waterLog.findMany({ where: { userId, date: { gte: fromD, lte: toD } } }),
        this.prisma.intimacyLog.findMany({ where: { userId, date: { gte: fromD, lte: toD } } }),
        this.prisma.note.findMany({ where: { userId, date: { gte: fromD, lte: toD } } }),
        this.prisma.medication.findMany({
          where: { userId, active: true },
          include: { schedules: { where: { enabled: true } } },
        }),
        this.prisma.medicationDose.findMany({
          where: {
            medication: { userId },
            takenAt: { not: null },
            scheduledAt: { gte: fromD, lte: new Date(toD.getTime() + 86400000 - 1) },
          },
          select: { id: true, medicationId: true, scheduledAt: true, takenAt: true },
        }),
      ]);
    return {
      from,
      to,
      periodDays,
      symptoms,
      moods,
      prediction,
      weight,
      sleep,
      water,
      intimacy,
      notes,
      medications,
      medicationDoses,
    };
  }
}
