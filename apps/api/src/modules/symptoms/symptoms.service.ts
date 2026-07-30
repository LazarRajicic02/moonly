import { Injectable, NotFoundException } from '@nestjs/common';
import { SymptomType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SymptomsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, from?: string, to?: string) {
    return this.prisma.symptomLog.findMany({
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

  create(userId: string, data: { date: string; type: SymptomType; severity?: number; notes?: string }) {
    return this.prisma.symptomLog.create({
      data: {
        userId,
        date: new Date(`${data.date}T00:00:00.000Z`),
        type: data.type,
        severity: data.severity ?? 3,
        notes: data.notes,
      },
    });
  }

  async remove(userId: string, id: string) {
    const row = await this.prisma.symptomLog.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException();
    await this.prisma.symptomLog.delete({ where: { id } });
    return { ok: true };
  }
}
