import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
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
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async getMe(@CurrentUserId() userId: string): Promise<{ message: string; data: unknown }> {
    const me = await this.usersService.getMe(userId);
    return {
      message: 'Fetched my profile successfully',
      data: me
    };
  }

  @Patch('me')
  @ApiOperation({ summary: '내 설정 업데이트' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
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
