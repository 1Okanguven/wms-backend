import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { AUDIT_KEY } from '../decorators/audit.decorator';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path, body, ip, user } = request;

    const action = this.reflector.getAllAndOverride<string>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!action) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.auditLogService.create({
            action,
            method,
            path,
            payload: this.maskSensitiveData(body),
            response: this.maskSensitiveData(response),
            statusCode: context.switchToHttp().getResponse().statusCode,
            userId: user?.id,
            ip,
          });
        },
        error: (error) => {
          this.auditLogService.create({
            action: `${action} (HATA)`,
            method,
            path,
            payload: this.maskSensitiveData(body),
            response: { message: error.message, stack: error.stack },
            statusCode: error.status || 500,
            userId: user?.id,
            ip,
          });
        },
      }),
    );
  }

  private maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const masked = Array.isArray(data) ? [...data] : { ...data };
    const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'credit_card', 'access_token'];

    for (const key in masked) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        masked[key] = '[MASKED]';
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskSensitiveData(masked[key]);
      }
    }

    return masked;
  }
}
