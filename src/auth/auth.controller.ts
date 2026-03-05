import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { ApiErrorResponseDto, ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import type { RequestWithContext } from '../common/types/request-with-context.interface';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import type { SocialUser } from './interfaces/social-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google 로그인 시작' })
  @ApiFoundResponse({
    description: 'Google OAuth consent 화면으로 리다이렉트됩니다.'
  })
  @ApiUnauthorizedResponse({
    description: 'OAuth 설정 또는 인증 실패',
    type: ApiErrorResponseDto
  })
  googleLogin(): void {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google 로그인 콜백' })
  @ApiOkResponse({
    description: 'Google 로그인 성공',
    type: ApiSuccessResponseDto,
    schema: {
      example: {
        ok: true,
        status: 200,
        message: 'Google login successful',
        data: {
          id: 'e79d41f7-b3af-4d88-b7f4-170ef16d5f2f',
          provider: 'google',
          providerId: '1122334455',
          email: 'user@example.com',
          name: 'Cap3 User',
          nickname: 'cap3-user',
          givenName: 'Cap3',
          familyName: 'User',
          picture: 'https://lh3.googleusercontent.com/a/profile-image',
          locale: 'ko',
          emailVerified: true,
          profile: {
            sub: '1122334455'
          },
          lastLoginAt: '2026-03-05T08:40:21Z',
          createdAt: '2026-03-05T08:40:21Z',
          updatedAt: '2026-03-05T08:40:21Z'
        },
        meta: {
          requestId: 'req_01hqx8m3f',
          timestamp: '2026-03-05T08:40:21Z'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Google 인증 실패',
    type: ApiErrorResponseDto
  })
  async googleCallback(@Req() req: RequestWithContext): Promise<{
    message: string;
    data: AuthenticatedUser;
  }> {
    const socialUser = req.user as SocialUser;
    const savedUser = await this.authService.saveSocialUser(socialUser);

    return {
      message: 'Google login successful',
      data: savedUser
    };
  }

  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: 'Kakao 로그인 시작' })
  @ApiFoundResponse({
    description: 'Kakao OAuth consent 화면으로 리다이렉트됩니다.'
  })
  @ApiUnauthorizedResponse({
    description: 'OAuth 설정 또는 인증 실패',
    type: ApiErrorResponseDto
  })
  kakaoLogin(): void {
    return;
  }

  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: 'Kakao 로그인 콜백' })
  @ApiOkResponse({
    description: 'Kakao 로그인 성공',
    type: ApiSuccessResponseDto,
    schema: {
      example: {
        ok: true,
        status: 200,
        message: 'Kakao login successful',
        data: {
          id: 'e79d41f7-b3af-4d88-b7f4-170ef16d5f2f',
          provider: 'kakao',
          providerId: '1234567890',
          email: 'user@example.com',
          name: '카카오 사용자',
          nickname: '카카오닉네임',
          givenName: null,
          familyName: null,
          picture: 'https://k.kakaocdn.net/dn/profile.jpg',
          locale: 'ko',
          emailVerified: true,
          profile: {
            id: 1234567890
          },
          lastLoginAt: '2026-03-05T08:40:21Z',
          createdAt: '2026-03-05T08:40:21Z',
          updatedAt: '2026-03-05T08:40:21Z'
        },
        meta: {
          requestId: 'req_01hqx8m3f',
          timestamp: '2026-03-05T08:40:21Z'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Kakao 인증 실패',
    type: ApiErrorResponseDto
  })
  async kakaoCallback(@Req() req: RequestWithContext): Promise<{
    message: string;
    data: AuthenticatedUser;
  }> {
    const socialUser = req.user as SocialUser;
    const savedUser = await this.authService.saveSocialUser(socialUser);

    return {
      message: 'Kakao login successful',
      data: savedUser
    };
  }
}
