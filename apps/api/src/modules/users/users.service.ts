import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { profile: true, subscription: true, notificationPreference: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  async updateMe(
    userId: string,
    data: {
      displayName?: string;
      locale?: string;
      timezone?: string;
      dateOfBirth?: string;
      averageCycleLen?: number;
      averagePeriodLen?: number;
      goals?: string[];
      heightCm?: number;
      theme?: string;
    },
  ) {
    const { averageCycleLen, averagePeriodLen, goals, heightCm, theme, dateOfBirth, ...userData } =
      data;
    const profileData = {
      averageCycleLen,
      averagePeriodLen,
      goals,
      heightCm,
      theme,
      dateOfBirth: dateOfBirth ? new Date(`${dateOfBirth}T00:00:00.000Z`) : undefined,
    };
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...userData,
        profile: {
          upsert: {
            create: profileData,
            update: profileData,
          },
        },
      },
      include: { profile: true },
    });
  }
}
