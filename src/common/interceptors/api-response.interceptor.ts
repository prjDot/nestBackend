import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import type { Response } from 'express';
import { map, Observable } from 'rxjs';
import type { RequestWithContext } from '../types/request-with-context.interface';

interface SuccessResponse<T = unknown> {
  ok: true;
  status: number;
  message: string;
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

interface ResponseEnvelopeCandidate {
  message?: string;
  data?: unknown;
}

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<unknown>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<SuccessResponse<unknown>> {
    if (context.getType() !== 'http') {
      return next.handle() as Observable<SuccessResponse<unknown>>;
    }

    const response = context.switchToHttp().getResponse<Response>();
    const request =
      context.switchToHttp().getRequest<RequestWithContext>();

    return next.handle().pipe(
      map((payload) => {
        if (this.isAlreadyWrapped(payload)) {
          return payload as SuccessResponse<unknown>;
        }

        const { message, data } = this.normalizePayload(payload);

        return {
          ok: true,
          status: response.statusCode,
          message,
          data,
          meta: {
            requestId: request.requestId ?? 'req_unknown',
            timestamp: new Date().toISOString()
          }
        };
      })
    );
  }

  private isAlreadyWrapped(payload: unknown): boolean {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const maybeWrapped = payload as Record<string, unknown>;
    return (
      maybeWrapped['ok'] === true &&
      typeof maybeWrapped['status'] === 'number' &&
      typeof maybeWrapped['message'] === 'string' &&
      typeof maybeWrapped['meta'] === 'object'
    );
  }

  private normalizePayload(payload: unknown): Required<ResponseEnvelopeCandidate> {
    if (!payload || typeof payload !== 'object') {
      return {
        message: 'Request successful',
        data: payload ?? null
      };
    }

    const candidate = payload as ResponseEnvelopeCandidate;

    if ('message' in candidate && 'data' in candidate) {
      return {
        message: candidate.message ?? 'Request successful',
        data: candidate.data ?? null
      };
    }

    return {
      message: 'Request successful',
      data: payload
    };
  }
}
