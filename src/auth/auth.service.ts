import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Profile } from 'passport-google-oauth20';
import type { AuthProvider, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import type { SocialUser } from './interfaces/social-user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  toGoogleUser(
    profile: Profile,
    accessToken: string,
    refreshToken?: string
  ): SocialUser {
    const profileJson = toProfileJsonObject(profile);
    const locale = toNullableString(profileJson['locale']);
    const emailVerified =
      profile.emails?.[0]?.verified ??
      toNullableBoolean(profileJson['email_verified']) ??
      false;

    return {
      provider: 'google',
      providerId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      name: profile.displayName,
      nickname: profile.username ?? null,
      givenName: profile.name?.givenName ?? null,
      familyName: profile.name?.familyName ?? null,
      picture: profile.photos?.[0]?.value ?? null,
      locale,
      emailVerified,
      profile: profileJson,
      accessToken,
      refreshToken: refreshToken ?? null
    };
  }

  toKakaoUser(
    profile: unknown,
    accessToken: string,
    refreshToken?: string
  ): SocialUser {
    const profileRecord = isRecord(profile) ? profile : {};
    const profileJson = toUnknownRecord(profileRecord['_json']);
    const kakaoAccount = toUnknownRecord(profileJson['kakao_account']);
    const kakaoProfile = toUnknownRecord(kakaoAccount['profile']);
    const properties = toUnknownRecord(profileJson['properties']);
    const providerId = toProviderId(profileRecord['id']);
    const fallbackName = `kakao_${providerId}`;

    const name =
      toNullableString(profileRecord['displayName']) ??
      toNullableString(profileRecord['username']) ??
      toNullableString(kakaoProfile['nickname']) ??
      toNullableString(properties['nickname']) ??
      fallbackName;

    const nickname =
      toNullableString(kakaoProfile['nickname']) ??
      toNullableString(properties['nickname']) ??
      toNullableString(profileRecord['username']);

    const picture =
      toNullableString(kakaoProfile['profile_image_url']) ??
      toNullableString(properties['profile_image']) ??
      toNullableString(properties['thumbnail_image']);

    const email = toNullableString(kakaoAccount['email']);
    const emailVerified =
      toNullableBoolean(kakaoAccount['is_email_verified']) ?? false;
    const locale = toNullableString(kakaoAccount['locale']);

    return {
      provider: 'kakao',
      providerId,
      email,
      name,
      nickname,
      givenName: null,
      familyName: null,
      picture,
      locale,
      emailVerified,
      profile: toInputJsonObject(profileRecord),
      accessToken,
      refreshToken: refreshToken ?? null
    };
  }

  async saveSocialUser(socialUser: SocialUser): Promise<AuthenticatedUser> {
    const now = new Date();
    const provider = toPrismaProvider(socialUser.provider);
    try {
      const savedUser = await this.prismaService.user.upsert({
        where: {
          provider_providerId: {
            provider,
            providerId: socialUser.providerId
          }
        },
        create: {
          provider,
          providerId: socialUser.providerId,
          email: socialUser.email,
          name: socialUser.name,
          nickname: socialUser.nickname,
          givenName: socialUser.givenName,
          familyName: socialUser.familyName,
          picture: socialUser.picture,
          locale: socialUser.locale,
          emailVerified: socialUser.emailVerified,
          profile: socialUser.profile,
          lastLoginAt: now
        },
        update: {
          email: socialUser.email,
          name: socialUser.name,
          nickname: socialUser.nickname,
          givenName: socialUser.givenName,
          familyName: socialUser.familyName,
          picture: socialUser.picture,
          locale: socialUser.locale,
          emailVerified: socialUser.emailVerified,
          profile: socialUser.profile,
          lastLoginAt: now
        }
      });

      return toAuthenticatedUser(savedUser);
    } catch (error) {
      if (isPrismaConnectivityError(error)) {
        throw new ServiceUnavailableException({
          code: 'DATABASE_UNAVAILABLE',
          message: '데이터베이스 연결에 실패했습니다. DATABASE_URL 및 DB 네트워크/TLS 설정을 확인해주세요.',
          detail: {
            reason: 'Check DATABASE_URL, database reachability, and TLS configuration.'
          }
        });
      }

      throw error;
    }
  }
}

function toAuthenticatedUser(user: User): AuthenticatedUser {
  const profile = toPublicProfile(user.profile);

  return {
    id: user.id,
    provider: toPublicProvider(user.provider),
    providerId: user.providerId,
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    givenName: user.givenName,
    familyName: user.familyName,
    picture: user.picture,
    locale: user.locale,
    emailVerified: user.emailVerified,
    profile,
    lastLoginAt: user.lastLoginAt.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

function toProfileJsonObject(profile: Profile): Prisma.InputJsonObject {
  const rawProfileJson = profile._json;

  if (!isRecord(rawProfileJson)) {
    return {};
  }

  const inputJsonObject: Record<string, Prisma.InputJsonValue | null> = {};

  for (const [key, value] of Object.entries(rawProfileJson)) {
    const inputJsonValue = toInputJsonValue(value);
    if (inputJsonValue !== undefined) {
      inputJsonObject[key] = inputJsonValue;
    }
  }

  return inputJsonObject as Prisma.InputJsonObject;
}

function toInputJsonObject(value: unknown): Prisma.InputJsonObject {
  if (!isRecord(value)) {
    return {};
  }

  const inputJsonObject: Record<string, Prisma.InputJsonValue | null> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    const normalizedValue = toInputJsonValue(nestedValue);
    if (normalizedValue !== undefined) {
      inputJsonObject[key] = normalizedValue;
    }
  }

  return inputJsonObject as Prisma.InputJsonObject;
}

function toInputJsonValue(
  value: unknown
): Prisma.InputJsonValue | null | undefined {
  if (value === null) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    const inputJsonArray: Array<Prisma.InputJsonValue | null> = [];
    for (const item of value) {
      const normalizedValue = toInputJsonValue(item);
      if (normalizedValue !== undefined) {
        inputJsonArray.push(normalizedValue);
      }
    }
    return inputJsonArray;
  }

  if (isRecord(value)) {
    const inputJsonObject: Record<string, Prisma.InputJsonValue | null> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedValue = toInputJsonValue(nestedValue);
      if (normalizedValue !== undefined) {
        inputJsonObject[key] = normalizedValue;
      }
    }
    return inputJsonObject as Prisma.InputJsonObject;
  }

  return undefined;
}

function toNullableString(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  return null;
}

function toNullableBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }

  return null;
}

function toProviderId(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }

  return 'unknown';
}

function toUnknownRecord(value: unknown): Record<string, unknown> {
  if (isRecord(value)) {
    return value;
  }

  return {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toPublicProfile(profile: Prisma.JsonValue): Record<string, unknown> {
  if (!isPrismaJsonObject(profile)) {
    return {};
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(profile)) {
    if (value !== undefined) {
      result[key] = toUnknownJsonValue(value);
    }
  }
  return result;
}

function toUnknownJsonValue(value: Prisma.JsonValue): unknown {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toUnknownJsonValue(item));
  }

  const nestedResult: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    if (nestedValue !== undefined) {
      nestedResult[key] = toUnknownJsonValue(nestedValue);
    }
  }
  return nestedResult;
}

function isPrismaJsonObject(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toPrismaProvider(provider: 'google' | 'kakao'): AuthProvider {
  return provider === 'google' ? 'GOOGLE' : 'KAKAO';
}

function toPublicProvider(provider: AuthProvider): 'google' | 'kakao' {
  return provider === 'GOOGLE' ? 'google' : 'kakao';
}

function isPrismaConnectivityError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const maybeCode = (error as { code?: unknown }).code;
    if (
      typeof maybeCode === 'string' &&
      ['P1001', 'P1002', 'P1011'].includes(maybeCode)
    ) {
      return true;
    }
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Can't reach database server") ||
    error.message.includes('Tenant or user not found') ||
    error.message.includes('Error opening a TLS connection') ||
    error.message.includes('self-signed certificate in certificate chain') ||
    error.message.includes('certificate verify failed')
  );
}
