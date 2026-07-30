import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: {
    userId?: string;
    action: AuditAction | `${AuditAction}`;
    resource: string;
    resourceId?: string;
    metadata?: Prisma.InputJsonValue;
    ip?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action as AuditAction,
        resource: input.resource,
        resourceId: input.resourceId,
        metadata: input.metadata,
        ip: input.ip,
        userAgent: input.userAgent,
      },
    });
  }
}
