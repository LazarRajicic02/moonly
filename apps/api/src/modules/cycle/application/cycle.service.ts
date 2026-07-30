import { Injectable, NotFoundException } from '@nestjs/common';
import { FlowLevel } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { computeCyclePrediction } from '../domain/cycle-prediction.service';

function parseDate(d: string) {
  return new Date(`${d}T00:00:00.000Z`);
}

@Injectable()
export class CycleService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.cycle.findMany({
      where: { userId },
      include: { periodDays: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async create(userId: string, data: { startDate: string; endDate?: string; notes?: string }) {
    const startDate = parseDate(data.startDate);
    const endDate = data.endDate ? parseDate(data.endDate) : undefined;
    const length = endDate
      ? Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1
      : undefined;

    const cycle = await this.prisma.cycle.create({
      data: { userId, startDate, endDate, length, notes: data.notes },
    });
    await this.recalculate(userId);
    return cycle;
  }

  async update(userId: string, id: string, data: { endDate?: string; notes?: string }) {
    const existing = await this.prisma.cycle.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Cycle not found');
    const endDate = data.endDate ? parseDate(data.endDate) : existing.endDate;
    const length = endDate
      ? Math.round((endDate.getTime() - existing.startDate.getTime()) / 86400000) + 1
      : existing.length;
    const cycle = await this.prisma.cycle.update({
      where: { id },
      data: { endDate: endDate ?? undefined, notes: data.notes, length },
    });
    await this.recalculate(userId);
    return cycle;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.cycle.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Cycle not found');
    await this.prisma.cycle.delete({ where: { id } });
    await this.recalculate(userId);
    return { ok: true };
  }

  async addPeriodDay(
    userId: string,
    data: { date: string; flow?: FlowLevel; notes?: string; cycleId?: string },
  ) {
    const date = parseDate(data.date);

    let activeCycle = await this.prisma.cycle.findFirst({
      where: { userId, endDate: null },
      orderBy: { startDate: 'desc' },
    });

    if (!activeCycle) {
      activeCycle = await this.prisma.cycle.create({
        data: { userId, startDate: date },
      });
    } else if (date < activeCycle.startDate) {
      activeCycle = await this.prisma.cycle.update({
        where: { id: activeCycle.id },
        data: { startDate: date },
      });
    }

    const day = await this.prisma.periodDay.upsert({
      where: { userId_date: { userId, date } },
      create: {
        userId,
        date,
        flow: data.flow ?? 'medium',
        notes: data.notes,
        cycleId: data.cycleId ?? activeCycle.id,
      },
      update: {
        flow: data.flow ?? 'medium',
        notes: data.notes,
        cycleId: data.cycleId ?? activeCycle.id,
      },
    });

    await this.recalculate(userId);
    return day;
  }

  async endActivePeriod(userId: string, endDate: string) {
    const end = parseDate(endDate);
    const activeCycle = await this.prisma.cycle.findFirst({
      where: { userId, endDate: null },
      orderBy: { startDate: 'desc' },
    });
    if (!activeCycle) throw new NotFoundException('Nema aktivne menstruacije');

    if (end < activeCycle.startDate) {
      throw new NotFoundException('Datum završetka mora biti posle početka');
    }

    await this.prisma.periodDay.deleteMany({
      where: { userId, date: { gt: end } },
    });

    const length = Math.round((end.getTime() - activeCycle.startDate.getTime()) / 86400000) + 1;
    const cycle = await this.prisma.cycle.update({
      where: { id: activeCycle.id },
      data: { endDate: end, length },
    });

    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (profile) {
      await this.prisma.userProfile.update({
        where: { userId },
        data: { averagePeriodLen: length },
      });
    }

    await this.recalculate(userId);
    return cycle;
  }

  async removePeriodDay(userId: string, date: string) {
    const parsed = parseDate(date);
    await this.prisma.periodDay.deleteMany({ where: { userId, date: parsed } });
    await this.recalculate(userId);
    return { ok: true };
  }

  async getPrediction(userId: string) {
    const latest = await this.prisma.cyclePrediction.findFirst({
      where: { userId },
      orderBy: { computedAt: 'desc' },
    });
    if (latest) return latest;
    return this.recalculate(userId);
  }

  async recalculate(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    const cycles = await this.prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: 'asc' },
    });
    const prediction = computeCyclePrediction(cycles, {
      defaultCycleLen: profile?.averageCycleLen ?? 28,
      defaultPeriodLen: profile?.averagePeriodLen ?? 5,
    });
    return this.prisma.cyclePrediction.create({
      data: { userId, ...prediction },
    });
  }
}
