import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { ApiErrorResponseDto, ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { BearerAuthGuard } from '../auth/guards/bearer-auth.guard';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@UseGuards(BearerAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: '내 정보 조회',
    description: '현재 access token에 연결된 사용자 프로필과 환경설정을 조회합니다.'
  })
  @ApiOkResponse({
    description: '내 프로필 조회 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiNotFoundResponse({
    description: '토큰의 사용자 id에 해당하는 사용자가 없음',
    type: ApiErrorResponseDto
  })
  async getMe(@CurrentUserId() userId: string): Promise<{ message: string; data: unknown }> {
    const me = await this.usersService.getMe(userId);
    return {
      message: 'Fetched my profile successfully',
      data: me
    };
  }

  @Patch('me')
  @ApiOperation({
    summary: '내 설정 업데이트',
    description: '이름, 닉네임, 프로필 이미지, locale, theme, 알림 설정을 수정합니다.'
  })
  @ApiOkResponse({
    description: '내 프로필 업데이트 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: 'DTO 검증 실패',
    type: ApiErrorResponseDto
  })
  async updateMe(
    @CurrentUserId() userId: string,
    @Body() body: UpdateMeDto
  ): Promise<{ message: string; data: unknown }> {
    const me = await this.usersService.updateMe(userId, body);
    return {
      message: 'Updated my profile successfully',
      data: me
    };
  }
}
