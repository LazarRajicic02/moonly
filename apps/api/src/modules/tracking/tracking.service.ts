import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  upsertWeight(userId: string, data: { date: string; kg: number; notes?: string }) {
    const date = new Date(`${data.date}T00:00:00.000Z`);
    return this.prisma.weightLog.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, kg: data.kg, notes: data.notes },
      update: { kg: data.kg, notes: data.notes },
    });
  }

  upsertSleep(userId: string, data: { date: string; hours: number; quality?: number; notes?: string }) {
    const date = new Date(`${data.date}T00:00:00.000Z`);
    return this.prisma.sleepLog.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, hours: data.hours, quality: data.quality, notes: data.notes },
      update: { hours: data.hours, quality: data.quality, notes: data.notes },
    });
  }

  upsertWater(userId: string, data: { date: string; ml: number }) {
    const date = new Date(`${data.date}T00:00:00.000Z`);
    return this.prisma.waterLog.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, ml: data.ml },
      update: { ml: data.ml },
    });
  }

  list(userId: string) {
    return Promise.all([
      this.prisma.weightLog.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 30 }),
      this.prisma.sleepLog.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 30 }),
      this.prisma.waterLog.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 30 }),
    ]).then(([weight, sleep, water]) => ({ weight, sleep, water }));
  }
}
