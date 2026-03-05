import type { Request } from 'express';
import type { SocialUser } from '../../auth/interfaces/social-user.interface';

export interface RequestWithContext extends Request {
  requestId?: string;
  user?: SocialUser;
}
