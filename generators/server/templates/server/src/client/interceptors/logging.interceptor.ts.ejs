import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    Logger.debug(`${context.getClass().name}.${context.getHandler().name}() : ${req.method} ${req.url}`, 'LoggingInterceptor');
    return next.handle().pipe(tap(data => false));
  }
}
