import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  users() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        locale: true,
        createdAt: true,
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async analytics() {
    const [userCount, cycleCount, symptomCount, moodCount, signups] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.cycle.count(),
      this.prisma.symptomLog.count(),
      this.prisma.moodLog.count(),
      this.prisma.user.groupBy({
        by: ['createdAt'],
        _count: true,
        orderBy: { createdAt: 'asc' },
        take: 30,
      }),
    ]);
    const byDay: Record<string, number> = {};
    for (const row of await this.prisma.user.findMany({
      where: { deletedAt: null },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })) {
      const day = row.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + 1;
    }
    return {
      totals: { users: userCount, cycles: cycleCount, symptoms: symptomCount, moods: moodCount },
      signupsByDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
      signups,
    };
  }
}
