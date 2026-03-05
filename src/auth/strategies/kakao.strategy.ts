import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { KakaoProfile } from 'passport-kakao';
import { Strategy } from 'passport-kakao';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    const clientID =
      configService.get<string>('KAKAO_REST_API_KEY') ??
      configService.get<string>('KAKAO_CLIENT_ID');
    const callbackURL = resolveCallbackUrl(configService);

    if (!clientID) {
      throw new Error(
        'KAKAO_REST_API_KEY (or KAKAO_CLIENT_ID) is required.'
      );
    }

    super({
      clientID,
      callbackURL,
      // profile_nickname/account_email are required; profile_image is optional consent.
      scope: ['profile_nickname', 'account_email', 'profile_image']
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: KakaoProfile,
    done: (error: unknown, user?: unknown) => void
  ): void {
    const user = this.authService.toKakaoUser(
      profile,
      accessToken,
      refreshToken
    );
    done(null, user);
  }
}

function resolveCallbackUrl(configService: ConfigService): string {
  const explicitCallbackUrl = configService.get<string>('KAKAO_CALLBACK_URL');

  if (explicitCallbackUrl) {
    return normalizeUrlPath(explicitCallbackUrl);
  }

  const port = configService.get<string>('PORT') ?? '8080';
  const appBaseUrl =
    configService.get<string>('APP_BASE_URL') ?? `http://localhost:${port}`;
  const defaultCallbackUrl = `${trimTrailingSlash(appBaseUrl)}/api/auth/kakao/callback`;

  return normalizeUrlPath(defaultCallbackUrl);
}

function trimTrailingSlash(input: string): string {
  if (input.endsWith('/')) {
    return input.slice(0, -1);
  }
  return input;
}

function normalizeUrlPath(input: string): string {
  try {
    const url = new URL(input);
    url.pathname = url.pathname.replace(/\/{2,}/g, '/');
    return url.toString();
  } catch {
    return input.replace(/([^:]\/)\/+/g, '$1');
  }
}
