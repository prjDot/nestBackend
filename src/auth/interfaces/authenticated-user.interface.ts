export interface AuthenticatedUser {
  id: string;
  provider: 'google' | 'kakao';
  providerId: string;
  email: string | null;
  name: string;
  nickname: string | null;
  givenName: string | null;
  familyName: string | null;
  picture: string | null;
  locale: string | null;
  emailVerified: boolean;
  profile: Record<string, unknown>;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}
