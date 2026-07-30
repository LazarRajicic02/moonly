import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class PregnancyService {
  constructor(private readonly prisma: PrismaService) {}

  get(userId: string) {
    return this.prisma.pregnancyProfile.findUnique({
      where: { userId },
      include: { checkIns: { orderBy: { date: 'desc' }, take: 50 } },
    });
  }

  upsert(userId: string, data: { dueDate?: string; lmpDate?: string; active?: boolean; notes?: string }) {
    return this.prisma.pregnancyProfile.upsert({
      where: { userId },
      create: {
        userId,
        dueDate: data.dueDate ? new Date(`${data.dueDate}T00:00:00.000Z`) : undefined,
        lmpDate: data.lmpDate ? new Date(`${data.lmpDate}T00:00:00.000Z`) : undefined,
        active: data.active ?? true,
        notes: data.notes,
      },
      update: {
        dueDate: data.dueDate ? new Date(`${data.dueDate}T00:00:00.000Z`) : undefined,
        lmpDate: data.lmpDate ? new Date(`${data.lmpDate}T00:00:00.000Z`) : undefined,
        active: data.active,
        notes: data.notes,
      },
      include: { checkIns: true },
    });
  }

  async addCheckIn(userId: string, data: { date: string; week?: number; weightKg?: number; notes?: string; symptoms?: string[] }) {
    const profile = await this.prisma.pregnancyProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Enable pregnancy mode first');
    return this.prisma.pregnancyCheckIn.create({
      data: {
        profileId: profile.id,
        date: new Date(`${data.date}T00:00:00.000Z`),
        week: data.week,
        weightKg: data.weightKg,
        notes: data.notes,
        symptoms: data.symptoms ?? [],
      },
    });
  }
}
