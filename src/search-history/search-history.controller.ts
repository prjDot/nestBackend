import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';
import { SearchHistoryService } from './search-history.service';

@ApiTags('Search')
@ApiBearerAuth('bearer')
@UseGuards(BearerAuthGuard)
@Controller('search')
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Get('history')
  @ApiOperation({
    summary: '최근 검색 기록 조회',
    description: '최신순으로 검색 기록을 조회합니다. `limit`은 1~50 범위를 권장합니다.'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '응답 개수. 미입력 시 10, 최대 50',
    schema: {
      type: 'integer',
      minimum: 1,
      maximum: 50,
      default: 10
    }
  })
  @ApiOkResponse({
    description: '검색 기록 조회 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiBadRequestResponse({
    description: '`limit`이 정수가 아닌 경우',
    type: ApiErrorResponseDto
  })
  async list(
    @CurrentUserId() userId: string,
    @Query('limit') limit?: string
  ): Promise<{ message: string; data: unknown }> {
    const parsedLimit = parseLimit(limit);
    const items = await this.searchHistoryService.list(userId, parsedLimit);
    return {
      message: 'Fetched search history successfully',
      data: items
    };
  }

  @Post('history')
  @ApiOperation({
    summary: '검색 기록 저장',
    description: '검색 심볼과 표시용 query를 저장하고, 최근 10개만 유지합니다.'
  })
  @ApiCreatedResponse({
    description: '검색 기록 저장 성공',
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
  @ApiOperation({
    summary: '검색 기록 삭제',
    description: '개별 검색 기록 하나를 삭제합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '검색 기록 UUID'
  })
  @ApiOkResponse({
    description: '검색 기록 삭제 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  @ApiNotFoundResponse({
    description: '검색 기록을 찾을 수 없음',
    type: ApiErrorResponseDto
  })
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
  @ApiOperation({
    summary: '검색 기록 전체 삭제',
    description: '현재 사용자의 검색 기록을 모두 삭제합니다.'
  })
  @ApiOkResponse({
    description: '검색 기록 전체 삭제 성공',
    type: ApiSuccessResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer 토큰이 없거나 유효하지 않음',
    type: ApiErrorResponseDto
  })
  async clear(@CurrentUserId() userId: string): Promise<{ message: string; data: null }> {
    await this.searchHistoryService.clear(userId);
    return {
      message: 'Cleared search history successfully',
      data: null
    };
  }
}

function parseLimit(limit: string | undefined): number {
  if (!limit) {
    return 10;
  }

  const parsedLimit = Number(limit);
  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    throw new BadRequestException({
      code: 'INVALID_REQUEST',
      message: 'limit 파라미터는 1 이상의 정수여야 합니다',
      detail: {
        limit
      }
    });
  }

  return parsedLimit;
}
