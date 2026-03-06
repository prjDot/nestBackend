import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable, tap } from 'rxjs';
import { AppLoggerService } from '../logger/app-logger.service';
import type { RequestWithContext } from '../types/request-with-context.interface';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithContext>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logByStatus(request, response.statusCode, startedAt);
        },
        error: (error: unknown) => {
          const statusCode = resolveStatusCode(error);
          this.logByStatus(request, statusCode, startedAt);
        }
      })
    );
  }

  private logByStatus(
    request: RequestWithContext,
    statusCode: number,
    startedAt: number
  ): void {
    const durationMs = Date.now() - startedAt;
    const message = this.formatMessage(request, statusCode, durationMs);

    if (statusCode >= 500) {
      this.logger.error(message, undefined, 'HTTP');
      return;
    }

    if (statusCode >= 400) {
      this.logger.warn(message, 'HTTP');
      return;
    }

    this.logger.info(message, 'HTTP');
  }

  private formatMessage(
    request: RequestWithContext,
    statusCode: number,
    durationMs: number
  ): string {
    const requestId = request.requestId ?? 'req_unknown';
    return `${request.method} ${request.originalUrl} ${statusCode} ${durationMs}ms requestId=${requestId}`;
  }
}

function resolveStatusCode(error: unknown): number {
  if (error instanceof HttpException) {
    return error.getStatus();
  }

  return HttpStatus.INTERNAL_SERVER_ERROR;
}
