import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import type { Response } from 'express';
import { STATUS_ERROR_CODE_MAP } from '../constants/error-codes';
import type { RequestWithContext } from '../types/request-with-context.interface';

interface ResolvedError {
  status: number;
  code: string;
  message: string;
  detail: unknown;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<RequestWithContext>();
    const resolved = this.resolveError(exception);

    response.status(resolved.status).json({
      ok: false,
      status: resolved.status,
      error: {
        code: resolved.code,
        message: resolved.message,
        detail: resolved.detail
      },
      meta: {
        requestId: request.requestId ?? 'req_unknown',
        timestamp: new Date().toISOString()
      }
    });
  }

  private resolveError(exception: unknown): ResolvedError {
    if (exception instanceof HttpException) {
      const status = exception.getStatus() as HttpStatus;
      const exceptionResponse = exception.getResponse();

      if (
        status === HttpStatus.BAD_REQUEST &&
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const message = (exceptionResponse as { message?: unknown }).message;

        if (Array.isArray(message)) {
          return {
            status,
            code: 'VALIDATION_ERROR',
            message: '요청 데이터 검증 실패',
            detail: message
          };
        }
      }

      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const body = exceptionResponse as {
          code?: string;
          message?: string | string[];
          detail?: unknown;
        };

        const normalizedMessage = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message;

        return {
          status,
          code: body.code ?? STATUS_ERROR_CODE_MAP[status] ?? 'INTERNAL_SERVER_ERROR',
          message:
            (normalizedMessage
              ? this.normalizeMessage(normalizedMessage)
              : undefined) ??
            this.defaultMessageByStatus(status),
          detail: body.detail ?? null
        };
      }

      if (typeof exceptionResponse === 'string') {
        return {
          status,
          code: STATUS_ERROR_CODE_MAP[status] ?? 'INTERNAL_SERVER_ERROR',
          message: this.normalizeMessage(exceptionResponse),
          detail: null
        };
      }

      return {
        status,
        code: STATUS_ERROR_CODE_MAP[status] ?? 'INTERNAL_SERVER_ERROR',
        message: this.defaultMessageByStatus(status),
        detail: null
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류',
      detail: null
    };
  }

  private defaultMessageByStatus(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return '잘못된 요청';
      case HttpStatus.UNAUTHORIZED:
        return '인증이 필요합니다';
      case HttpStatus.FORBIDDEN:
        return '권한이 없습니다';
      case HttpStatus.NOT_FOUND:
        return '리소스를 찾을 수 없습니다';
      case HttpStatus.CONFLICT:
        return '리소스 충돌';
      case HttpStatus.TOO_MANY_REQUESTS:
        return '요청 제한 초과';
      default:
        return '서버 내부 오류';
    }
  }

  private normalizeMessage(message: string): string {
    return message.replace(/\/{2,}/g, '/');
  }
}
