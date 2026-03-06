import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthTokenService } from './auth-token.service';
import { AuthService } from './auth.service';
import { BearerAuthGuard } from './guards/bearer-auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';

@Module({
  imports: [PassportModule.register({ session: false })],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokenService,
    BearerAuthGuard,
    GoogleStrategy,
    KakaoStrategy
  ],
  exports: [AuthTokenService, BearerAuthGuard]
})
export class AuthModule {}
