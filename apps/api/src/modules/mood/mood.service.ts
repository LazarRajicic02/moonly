import { Injectable, NotFoundException } from '@nestjs/common';
import { MoodType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class MoodService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, from?: string, to?: string) {
    return this.prisma.moodLog.findMany({
      where: {
        userId,
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
                ...(to ? { lte: new Date(`${to}T00:00:00.000Z`) } : {}),
              },
            }
          : {}),
      },
      orderBy: { date: 'desc' },
    });
  }

  create(userId: string, data: { date: string; mood: MoodType; intensity?: number; notes?: string }) {
    return this.prisma.moodLog.create({
      data: {
        userId,
        date: new Date(`${data.date}T00:00:00.000Z`),
        mood: data.mood,
        intensity: data.intensity ?? 3,
        notes: data.notes,
      },
    });
  }

  async remove(userId: string, id: string) {
    const row = await this.prisma.moodLog.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException();
    await this.prisma.moodLog.delete({ where: { id } });
    return { ok: true };
  }
}
