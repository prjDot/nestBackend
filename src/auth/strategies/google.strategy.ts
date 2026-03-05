import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Profile,
  Strategy,
  VerifyCallback
} from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret =
      configService.get<string>('GOOGLE_CLIENT_SECRET_KEY') ??
      configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = resolveCallbackUrl(configService);

    if (!clientID || !clientSecret) {
      throw new Error(
        'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (or GOOGLE_CLIENT_SECRET_KEY) are required.'
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['profile', 'email']
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): void {
    const user = this.authService.toGoogleUser(
      profile,
      accessToken,
      refreshToken
    );
    done(null, user);
  }
}

function resolveCallbackUrl(configService: ConfigService): string {
  const explicitCallbackUrl = configService.get<string>('GOOGLE_CALLBACK_URL');

  if (explicitCallbackUrl) {
    return normalizeUrlPath(explicitCallbackUrl);
  }

  const port = configService.get<string>('PORT') ?? '8080';
  const appBaseUrl =
    configService.get<string>('APP_BASE_URL') ?? `http://localhost:${port}`;
  const defaultCallbackUrl = `${trimTrailingSlash(appBaseUrl)}/api/auth/google/callback`;

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
