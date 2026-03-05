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
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';
import { SearchHistoryService } from './search-history.service';

@ApiTags('Search')
@ApiBearerAuth('bearer')
@UseGuards(BearerAuthGuard)
@Controller('search')
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Get('history')
  @ApiOperation({ summary: '최근 검색 기록 조회' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async list(
    @CurrentUserId() userId: string,
    @Query('limit') limit?: string
  ): Promise<{ message: string; data: unknown }> {
    const parsedLimit = limit ? Number(limit) : 10;
    const items = await this.searchHistoryService.list(userId, parsedLimit);
    return {
      message: 'Fetched search history successfully',
      data: items
    };
  }

  @Post('history')
  @ApiOperation({ summary: '검색 기록 저장' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async create(
    @CurrentUserId() userId: string,
    @Body() body: CreateSearchHistoryDto
  ): Promise<{ message: string; data: unknown }> {
    const item = await this.searchHistoryService.add(userId, body);
    return {
      message: 'Saved search history successfully',
      data: item
    };
  }

  @Delete('history/:id')
  @ApiOperation({ summary: '검색 기록 삭제' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async remove(
    @CurrentUserId() userId: string,
    @Param('id') id: string
  ): Promise<{ message: string; data: null }> {
    await this.searchHistoryService.remove(userId, id);
    return {
      message: 'Deleted search history successfully',
      data: null
    };
  }

  @Delete('history')
  @ApiOperation({ summary: '검색 기록 전체 삭제' })
  @ApiOkResponse({ type: ApiSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async clear(@CurrentUserId() userId: string): Promise<{ message: string; data: null }> {
    await this.searchHistoryService.clear(userId);
    return {
      message: 'Cleared search history successfully',
      data: null
    };
  }
}
