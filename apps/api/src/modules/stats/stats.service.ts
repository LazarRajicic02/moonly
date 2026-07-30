import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(userId: string) {
    const [symptoms, moods, cycles, prediction, weight, sleep, water, intimacy] = await Promise.all([
      this.prisma.symptomLog.findMany({ where: { userId }, take: 200, orderBy: { date: 'desc' } }),
      this.prisma.moodLog.findMany({ where: { userId }, take: 200, orderBy: { date: 'desc' } }),
      this.prisma.cycle.findMany({ where: { userId }, orderBy: { startDate: 'desc' }, take: 12 }),
      this.prisma.cyclePrediction.findFirst({ where: { userId }, orderBy: { computedAt: 'desc' } }),
      this.prisma.weightLog.findMany({ where: { userId }, orderBy: { date: 'asc' }, take: 60 }),
      this.prisma.sleepLog.findMany({ where: { userId }, orderBy: { date: 'asc' }, take: 60 }),
      this.prisma.waterLog.findMany({ where: { userId }, orderBy: { date: 'asc' }, take: 60 }),
      this.prisma.intimacyLog.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 100 }),
    ]);

    const symptomFrequency: Record<string, number> = {};
    for (const s of symptoms) symptomFrequency[s.type] = (symptomFrequency[s.type] ?? 0) + 1;

    const moodDistribution: Record<string, number> = {};
    for (const m of moods) moodDistribution[m.mood] = (moodDistribution[m.mood] ?? 0) + 1;

    const cycleLengths = cycles.filter((c) => c.length).map((c) => c.length!);

    return {
      counts: {
        symptoms: symptoms.length,
        moods: moods.length,
        cycles: cycles.length,
      },
      symptomFrequency,
      moodDistribution,
      averageCycleLength:
        cycleLengths.length > 0
          ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
          : prediction?.avgCycleLength ?? 28,
      prediction,
      series: { weight, sleep, water },
      intimacy,
    };
  }
}
