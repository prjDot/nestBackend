import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { BearerAuthGuard } from '../auth/guards/bearer-auth.guard';
import { ApiErrorResponseDto, ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import { CreateWatchlistItemDto } from './dto/create-watchlist-item.dto';
import { WatchlistService } from './watchlist.service';

@ApiTags('Watchlist')
@ApiBearerAuth('bearer')
@UseGuards(BearerAuthGuard)
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post()
  @ApiOperation({
    summary: '관심 종목 추가',
    description: '관심 종목을 추가합니다. 사용자당 최대 50개까지 등록할 수 있습니다.'
  })
  @ApiCreatedResponse({
    description: '관심 종목 추가 성공',
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
  @ApiConflictResponse({
    description: '중복 심볼 또는 50개 제한 초과',
    type: ApiErrorResponseDto
  })
  async create(
    @CurrentUserId() userId: string,
    @Body() body: CreateWatchlistItemDto
  ): Promise<{ message: string; data: unknown }> {
    const item = await this.watchlistService.add(userId, body);
    return {
      message: 'Watchlist item added successfully',
      data: item
    };
  }

  @Get()
  @ApiOperation({
    summary: '관심 종목 목록 조회',
    description:
      '`sort=added`만 현재 지원합니다. `price` / `change` 정렬은 한국투자증권 API 연동 이후 활성화됩니다.'
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: '정렬 기준. 현재 added만 지원',
    schema: {
      type: 'string',
      enum: ['added', 'price', 'change'],
      default: 'added'
    }
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: '정렬 방향',
    schema: {
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'desc'
    }
  })
  @ApiOkResponse({
    description: '관심 종목 목록 조회 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: '지원하지 않는 sort 값',
    type: ApiErrorResponseDto
  })
  async list(
    @CurrentUserId() userId: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string
  ): Promise<{ message: string; data: unknown }> {
    const items = await this.watchlistService.list(userId, sort, order);
    return {
      message: 'Fetched watchlist successfully',
      data: items
    };
  }

  @Delete(':symbol')
  @ApiOperation({
    summary: '관심 종목 삭제',
    description: '심볼 단위로 관심 종목을 삭제합니다.'
  })
  @ApiParam({
    name: 'symbol',
    description: '삭제할 종목 심볼',
    example: 'AAPL'
  })
  @ApiOkResponse({
    description: '관심 종목 삭제 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiNotFoundResponse({
    description: '관심 종목을 찾을 수 없음',
    type: ApiErrorResponseDto
  })
  async remove(
    @CurrentUserId() userId: string,
    @Param('symbol') symbol: string
  ): Promise<{ message: string; data: null }> {
    await this.watchlistService.remove(userId, symbol);
    return {
      message: 'Watchlist item removed successfully',
      data: null
    };
  }
}
