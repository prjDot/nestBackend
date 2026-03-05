import { randomUUID } from 'crypto';
import type { NextFunction, Response } from 'express';
import type { RequestWithContext } from '../types/request-with-context.interface';

export function requestContextMiddleware(
  req: RequestWithContext,
  res: Response,
  next: NextFunction
): void {
  const incomingRequestId =
    typeof req.headers['x-request-id'] === 'string'
      ? req.headers['x-request-id']
      : undefined;

  const requestId =
    incomingRequestId?.trim() ??
    `req_${randomUUID().replace(/-/g, '').slice(0, 10)}`;

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  next();
}
