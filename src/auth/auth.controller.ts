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
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { GoogleUser } from './interfaces/google-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
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
          provider: 'google',
          id: '1122334455',
          email: 'user@example.com',
          name: 'Cap3 User',
          picture: 'https://lh3.googleusercontent.com/a/profile-image',
          accessToken: 'ya29.a0...',
          refreshToken: null
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
  googleCallback(@Req() req: RequestWithContext): {
    message: string;
    data: GoogleUser;
  } {
    return {
      message: 'Google login successful',
      data: req.user as GoogleUser
    };
  }
}
