import type { Request } from 'express';

export interface RequestWithContext extends Request {
  requestId?: string;
  user?: any; // 추후 커스텀 유저 타입으로 대체
}
