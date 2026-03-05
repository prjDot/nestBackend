import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { ApiErrorResponseDto, ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import type { RequestWithContext } from '../common/types/request-with-context.interface';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { CurrentUserId } from './decorators/current-user-id.decorator';
import { BearerAuthGuard } from './guards/bearer-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import type { SocialUser } from './interfaces/social-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authTokenService: AuthTokenService
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google 로그인 시작',
    description:
      '프론트엔드는 브라우저를 이 endpoint로 이동시켜 Google OAuth flow를 시작합니다.'
  })
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
  @ApiOperation({
    summary: 'Google 로그인 콜백',
    description:
      'Google 인증 완료 후 provider가 호출하는 callback endpoint입니다. 직접 호출하지 말고 `/api/auth/google`으로 시작해야 합니다.'
  })
  @ApiOkResponse({
    description: 'Google 로그인 성공',
    type: ApiSuccessResponseDto,
    schema: {
      example: {
        ok: true,
        status: 200,
        message: 'Google login successful',
        data: {
          accessToken: 'eyJhbGciOi...cap3',
          user: {
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
          }
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
  @ApiServiceUnavailableResponse({
    description: 'OAuth는 성공했지만 사용자 저장을 위한 DB 연결에 실패',
    type: ApiErrorResponseDto
  })
  async googleCallback(@Req() req: RequestWithContext): Promise<{
    message: string;
    data: { accessToken: string; user: AuthenticatedUser };
  }> {
    const socialUser = req.user as SocialUser;
    const savedUser = await this.authService.saveSocialUser(socialUser);
    const accessToken = this.authTokenService.issueToken(savedUser.id);

    return {
      message: 'Google login successful',
      data: {
        accessToken,
        user: savedUser
      }
    };
  }

  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({
    summary: 'Kakao 로그인 시작',
    description:
      '프론트엔드는 브라우저를 이 endpoint로 이동시켜 Kakao OAuth flow를 시작합니다.'
  })
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
  @ApiOperation({
    summary: 'Kakao 로그인 콜백',
    description:
      'Kakao 인증 완료 후 provider가 호출하는 callback endpoint입니다. 직접 호출하지 말고 `/api/auth/kakao`로 시작해야 합니다.'
  })
  @ApiOkResponse({
    description: 'Kakao 로그인 성공',
    type: ApiSuccessResponseDto,
    schema: {
      example: {
        ok: true,
        status: 200,
        message: 'Kakao login successful',
        data: {
          accessToken: 'eyJhbGciOi...cap3',
          user: {
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
          }
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
  @ApiServiceUnavailableResponse({
    description: 'OAuth는 성공했지만 사용자 저장을 위한 DB 연결에 실패',
    type: ApiErrorResponseDto
  })
  async kakaoCallback(@Req() req: RequestWithContext): Promise<{
    message: string;
    data: { accessToken: string; user: AuthenticatedUser };
  }> {
    const socialUser = req.user as SocialUser;
    const savedUser = await this.authService.saveSocialUser(socialUser);
    const accessToken = this.authTokenService.issueToken(savedUser.id);

    return {
      message: 'Kakao login successful',
      data: {
        accessToken,
        user: savedUser
      }
    };
  }

  @Post('logout')
  @UseGuards(BearerAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '로그아웃',
    description:
      '현재 서버 구현은 stateless Bearer 토큰 구조이므로, FE에서 access token을 폐기하는 방식으로 처리합니다.'
  })
  @ApiOkResponse({
    description: '로그아웃 성공',
    type: ApiSuccessResponseDto
  })
  logout(): { message: string; data: null } {
    return {
      message: 'Logout successful',
      data: null
    };
  }

  @Delete('account')
  @UseGuards(BearerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '회원 탈퇴',
    description: '현재 로그인된 사용자의 계정과 연결된 내부 데이터를 삭제합니다.'
  })
  @ApiOkResponse({
    description: '계정 삭제 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
    type: ApiErrorResponseDto
  })
  async deleteAccount(@CurrentUserId() userId: string): Promise<{
    message: string;
    data: null;
  }> {
    await this.authService.deleteAccount(userId);

    return {
      message: 'Account deleted successfully',
      data: null
    };
  }
}
