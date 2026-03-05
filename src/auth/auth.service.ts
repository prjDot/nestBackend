import { Injectable } from '@nestjs/common';
import type { Profile } from 'passport-google-oauth20';
import type { GoogleUser } from './interfaces/google-user.interface';

@Injectable()
export class AuthService {
  toGoogleUser(
    profile: Profile,
    accessToken: string,
    refreshToken?: string
  ): GoogleUser {
    return {
      provider: 'google',
      id: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      name: profile.displayName,
      picture: profile.photos?.[0]?.value ?? null,
      accessToken,
      refreshToken: refreshToken ?? null
    };
  }
}
