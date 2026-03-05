import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithContext } from '../../common/types/request-with-context.interface';
import { resolvePassportFailureDetail } from '../utils/passport-failure.util';

@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext
  ): TUser {
    if (err || !user) {
      const request = context.switchToHttp().getRequest<RequestWithContext>();
      const failureDetail = resolvePassportFailureDetail(err, info);
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Kakao 인증에 실패했습니다',
        detail: {
          requestId: request.requestId ?? 'req_unknown',
          reason: failureDetail.reason,
          providerErrorCode: failureDetail.providerErrorCode ?? null,
          providerStatus: failureDetail.providerStatus ?? null
        }
      });
    }

    return user;
  }
}
