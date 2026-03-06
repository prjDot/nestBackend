import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { KakaoProfile, StrategyOptions } from 'passport-kakao';
import { Strategy } from 'passport-kakao';
import { resolveCallbackUrl } from '../../common/url/app-url.util';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  private static readonly logger = new Logger(KakaoStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    const clientID =
      configService.get<string>('KAKAO_REST_API_KEY') ??
      configService.get<string>('KAKAO_CLIENT_ID');
    const clientSecret =
      configService.get<string>('KAKAO_CLIENT_SECRET_KEY') ??
      configService.get<string>('KAKAO_CLIENT_SECRET') ??
      configService.get<string>('KAKAO_CLIENT_SECRE_KEY') ??
      configService.get<string>('KAKAO_CLIENT_SECRE');
    const callbackURL = resolveCallbackUrl(
      (key) => configService.get<string>(key),
      'KAKAO_CALLBACK_URL',
      '/api/auth/kakao/callback'
    );
    const explicitCallbackUrl = configService.get<string>('KAKAO_CALLBACK_URL');

    if (!clientID) {
      throw new Error(
        'KAKAO_REST_API_KEY (or KAKAO_CLIENT_ID) is required.'
      );
    }

    const strategyOptions: StrategyOptions = {
      clientID,
      callbackURL,
      // profile_nickname/account_email are required; profile_image is optional consent.
      scope: ['profile_nickname', 'account_email', 'profile_image']
    };

    if (clientSecret) {
      strategyOptions.clientSecret = clientSecret;
    }

    super(strategyOptions);

    if (!explicitCallbackUrl) {
      KakaoStrategy.logger.warn(
        `KAKAO_CALLBACK_URL is not set. Using fallback callback URL: ${callbackURL}`
      );
    }
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
