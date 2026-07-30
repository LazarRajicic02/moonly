import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.note.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  create(userId: string, data: { date: string; content: string }) {
    return this.prisma.note.create({
      data: {
        userId,
        date: new Date(`${data.date}T00:00:00.000Z`),
        content: data.content,
      },
    });
  }

  async remove(userId: string, id: string) {
    const row = await this.prisma.note.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException();
    await this.prisma.note.delete({ where: { id } });
    return { ok: true };
  }
}
