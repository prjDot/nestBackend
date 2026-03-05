import type { Prisma } from '@prisma/client';

export type SocialProvider = 'google' | 'kakao';

export interface SocialUser {
  provider: SocialProvider;
  providerId: string;
  email: string | null;
  name: string;
  nickname: string | null;
  givenName: string | null;
  familyName: string | null;
  picture: string | null;
  locale: string | null;
  emailVerified: boolean;
  profile: Prisma.InputJsonObject;
  accessToken: string;
  refreshToken: string | null;
}
