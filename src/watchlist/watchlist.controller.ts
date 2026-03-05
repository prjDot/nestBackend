import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
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
  @ApiOperation({ summary: '관심 종목 추가' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
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
  @ApiOperation({ summary: '관심 종목 목록 조회' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
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
  @ApiOperation({ summary: '관심 종목 삭제' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
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
