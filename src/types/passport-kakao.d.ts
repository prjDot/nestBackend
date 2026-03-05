declare module 'passport-kakao' {
  import type { Strategy as PassportStrategy } from 'passport';

  export interface KakaoProfile {
    id: string | number;
    username?: string;
    displayName?: string;
    _json?: unknown;
  }

  export interface StrategyOptions {
    clientID: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback?: false;
    state?: boolean;
  }

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: KakaoProfile,
    done: (error: unknown, user?: unknown, info?: unknown) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
  }
}
