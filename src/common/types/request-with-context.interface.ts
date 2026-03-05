import type { Request } from 'express';
import type { GoogleUser } from '../../auth/interfaces/google-user.interface';

export interface RequestWithContext extends Request {
  requestId?: string;
  user?: GoogleUser;
}
