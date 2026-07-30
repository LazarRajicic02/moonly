import { Injectable } from '@nestjs/common';
import { FertilitySignType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class FertilityService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.fertilitySign.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 100 });
  }

  create(userId: string, data: { date: string; type: FertilitySignType; value: string; notes?: string }) {
    return this.prisma.fertilitySign.create({
      data: {
        userId,
        date: new Date(`${data.date}T00:00:00.000Z`),
        type: data.type,
        value: data.value,
        notes: data.notes,
      },
    });
  }
}
