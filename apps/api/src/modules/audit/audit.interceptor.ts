import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AUDIT_KEY } from '../../common/decorators/public.decorator';
import { AuditService } from './audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const resource = this.reflector.getAllAndOverride<string>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!resource) return next.handle();

    const req = context.switchToHttp().getRequest<{
      user?: AuthUser;
      method: string;
      ip?: string;
      headers: Record<string, string>;
      params: { id?: string };
    }>();

    return next.handle().pipe(
      tap(() => {
        const action =
          req.method === 'POST'
            ? 'CREATE'
            : req.method === 'DELETE'
              ? 'DELETE'
              : 'UPDATE';
        void this.audit.log({
          userId: req.user?.id,
          action,
          resource,
          resourceId: req.params?.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }),
    );
  }
}
