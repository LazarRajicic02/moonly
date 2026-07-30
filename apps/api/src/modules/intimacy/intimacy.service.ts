import { Injectable, NotFoundException } from '@nestjs/common';
import { IntimacyLocation } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class IntimacyService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, from?: string, to?: string) {
    return this.prisma.intimacyLog.findMany({
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
      take: 100,
    });
  }

  create(
    userId: string,
    data: {
      date: string;
      protected?: boolean;
      rating?: number;
      location?: IntimacyLocation;
      notes?: string;
    },
  ) {
    return this.prisma.intimacyLog.create({
      data: {
        userId,
        date: new Date(`${data.date}T00:00:00.000Z`),
        protected: data.protected,
        rating: data.rating,
        location: data.location,
        notes: data.notes,
      },
    });
  }

  async remove(userId: string, id: string) {
    const row = await this.prisma.intimacyLog.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException();
    await this.prisma.intimacyLog.delete({ where: { id } });
    return { ok: true };
  }
}
