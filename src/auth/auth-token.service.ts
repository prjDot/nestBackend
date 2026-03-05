import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Buffer } from 'buffer';
import { createHmac, timingSafeEqual } from 'crypto';

interface AuthTokenPayload {
  sub: string;
  exp: number;
}

@Injectable()
export class AuthTokenService {
  private readonly logger = new Logger(AuthTokenService.name);
  private readonly secret: string;
  private readonly expiresInSec: number;

  constructor(configService: ConfigService) {
    this.secret = configService.get<string>('AUTH_TOKEN_SECRET') ?? 'cap3-dev-secret-change-me';
    this.expiresInSec = Number(configService.get<string>('AUTH_TOKEN_EXPIRES_IN_SEC') ?? 60 * 60 * 24 * 7);

    if (!configService.get<string>('AUTH_TOKEN_SECRET')) {
      this.logger.warn('AUTH_TOKEN_SECRET is not set. Using a non-production default secret.');
    }
  }

  issueToken(userId: string): string {
    const payload: AuthTokenPayload = {
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + this.expiresInSec
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    const signature = this.sign(encodedPayload);

    return `${encodedPayload}.${signature}`;
  }

  verifyToken(token: string): AuthTokenPayload | null {
    const [encodedPayload, incomingSignature] = token.split('.');
    if (!encodedPayload || !incomingSignature) {
      return null;
    }

    const expectedSignature = this.sign(encodedPayload);
    const isValidSignature = safeCompare(incomingSignature, expectedSignature);
    if (!isValidSignature) {
      return null;
    }

    const payload = decodePayload(encodedPayload);
    if (!payload) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  }

  private sign(encodedPayload: string): string {
    return createHmac('sha256', this.secret)
      .update(encodedPayload)
      .digest('base64url');
  }
}

function decodePayload(encodedPayload: string): AuthTokenPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as
      | Partial<AuthTokenPayload>
      | null;

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    if (typeof parsed.sub !== 'string' || typeof parsed.exp !== 'number') {
      return null;
    }

    return {
      sub: parsed.sub,
      exp: parsed.exp
    };
  } catch {
    return null;
  }
}

function safeCompare(incomingSignature: string, expectedSignature: string): boolean {
  try {
    const incomingBuffer = Buffer.from(incomingSignature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (incomingBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(incomingBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
