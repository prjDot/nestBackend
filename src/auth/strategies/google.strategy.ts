import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Profile,
  Strategy,
  VerifyCallback
} from 'passport-google-oauth20';
import { resolveCallbackUrl } from '../../common/url/app-url.util';
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
    const callbackURL = resolveCallbackUrl(
      (key) => configService.get<string>(key),
      'GOOGLE_CALLBACK_URL',
      '/api/auth/google/callback'
    );

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
