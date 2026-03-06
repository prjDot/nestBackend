import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthTokenService } from '../auth-token.service';
import type { RequestWithContext } from '../../common/types/request-with-context.interface';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(private readonly authTokenService: AuthTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const token = extractBearerToken(request.headers['authorization']);

    if (!token) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: '인증이 필요합니다',
        detail: null
      });
    }

    const payload = this.authTokenService.verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: '유효하지 않은 토큰입니다',
        detail: null
      });
    }

    request.currentUserId = payload.sub;
    return true;
  }
}

function extractBearerToken(authorization: string | undefined): string | null {
  if (!authorization) {
    return null;
  }

  const [type, token] = authorization.trim().split(' ');
  if (type?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}
