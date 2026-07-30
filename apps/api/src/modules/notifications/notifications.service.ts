import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  registerToken(userId: string, token: string, platform = 'web') {
    return this.prisma.devicePushToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform },
    });
  }

  getPreferences(userId: string) {
    return this.prisma.notificationPreference.findUnique({ where: { userId } });
  }

  updatePreferences(
    userId: string,
    data: Partial<{
      pushEnabled: boolean;
      emailEnabled: boolean;
      medicationRemind: boolean;
      cycleReminders: boolean;
      marketing: boolean;
    }>,
  ) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
