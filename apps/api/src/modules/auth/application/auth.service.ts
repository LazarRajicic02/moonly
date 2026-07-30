import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { computeCyclePrediction } from '../../cycle/domain/cycle-prediction.service';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueTokens(user: { id: string; email: string; role: Role }, meta?: { ua?: string; ip?: string }) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_TTL', '15m'),
      },
    );

    const refreshToken = randomBytes(48).toString('hex');
    const familyId = randomBytes(16).toString('hex');
    const ttl = this.config.get('JWT_REFRESH_TTL', '7d');
    const days = ttl.endsWith('d') ? parseInt(ttl, 10) : 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        familyId,
        expiresAt,
        userAgent: meta?.ua,
        ip: meta?.ip,
      },
    });

    return { accessToken, refreshToken };
  }

  async register(input: {
    email: string;
    password: string;
    displayName: string;
    locale?: string;
    dateOfBirth?: string;
    averageCycleLen?: number;
    averagePeriodLen?: number;
    lastPeriodStart?: string;
    goals?: string[];
    heightCm?: number;
  }, meta?: { ua?: string; ip?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const cycleLen = input.averageCycleLen ?? 28;
    const periodLen = input.averagePeriodLen ?? 5;
    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        displayName: input.displayName,
        locale: input.locale ?? 'en',
        profile: {
          create: {
            dateOfBirth: input.dateOfBirth ? new Date(`${input.dateOfBirth}T00:00:00.000Z`) : undefined,
            averageCycleLen: cycleLen,
            averagePeriodLen: periodLen,
            goals: input.goals ?? [],
            heightCm: input.heightCm,
          },
        },
        notificationPreference: { create: {} },
        subscription: { create: {} },
        consents: {
          create: [
            { type: 'terms', granted: true, version: '1.0' },
            { type: 'privacy', granted: true, version: '1.0' },
          ],
        },
      },
    });

    if (input.lastPeriodStart) {
      const startDate = new Date(`${input.lastPeriodStart}T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setUTCDate(endDate.getUTCDate() + periodLen - 1);
      const cycle = await this.prisma.cycle.create({
        data: { userId: user.id, startDate, endDate },
      });
      for (let day = 0; day < periodLen; day++) {
        const date = new Date(startDate);
        date.setUTCDate(date.getUTCDate() + day);
        await this.prisma.periodDay.create({
          data: { userId: user.id, cycleId: cycle.id, date, flow: 'medium' },
        });
      }
      const prediction = computeCyclePrediction([{ startDate, endDate }], {
        defaultCycleLen: cycleLen,
        defaultPeriodLen: periodLen,
      });
      await this.prisma.cyclePrediction.create({ data: { userId: user.id, ...prediction } });
    }

    await this.audit.log({
      userId: user.id,
      action: 'CREATE',
      resource: 'user',
      resourceId: user.id,
      ip: meta?.ip,
      userAgent: meta?.ua,
    });

    const tokens = await this.issueTokens(user, meta);
    return { user: this.sanitize(user), ...tokens };
  }

  async login(input: { email: string; password: string }, meta?: { ua?: string; ip?: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || user.deletedAt) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.audit.log({
      userId: user.id,
      action: 'LOGIN',
      resource: 'auth',
      ip: meta?.ip,
      userAgent: meta?.ua,
    });

    const tokens = await this.issueTokens(user, meta);
    return { user: this.sanitize(user), ...tokens };
  }

  async refresh(rawToken: string, meta?: { ua?: string; ip?: string }) {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    if (stored.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: stored.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || user.deletedAt) throw new UnauthorizedException('User not found');

    const tokens = await this.issueTokens(user, meta);
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: {
        revokedAt: new Date(),
        replacedBy: this.hashToken(tokens.refreshToken),
      },
    });

    // Keep family continuity
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(tokens.refreshToken) },
      data: { familyId: stored.familyId },
    });

    return { user: this.sanitize(user), ...tokens };
  }

  async logout(rawToken?: string, userId?: string) {
    if (rawToken) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: this.hashToken(rawToken) },
        data: { revokedAt: new Date() },
      });
    } else if (userId) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    if (userId) {
      await this.audit.log({ userId, action: 'LOGOUT', resource: 'auth' });
    }
    return { ok: true };
  }

  sanitize(user: { id: string; email: string; displayName: string; role: Role; locale: string }) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      locale: user.locale,
    };
  }
}
