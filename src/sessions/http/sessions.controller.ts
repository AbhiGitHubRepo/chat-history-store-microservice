import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiKeyGuard } from '../../common/guard/api-key.gaurd';
import { RateLimitGuard } from '../../common/guard/rate-limit.gaurd';
import { StartSessionDto, RenameSessionDto, ToggleFavoriteDto } from '../dto';
import { CreateSessionUC, DeleteSessionUC, FavoriteSessionUC, ListSessionsUC, RenameSessionUC } from '../application/usecases';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('sessions')
@ApiSecurity('apiKey')
@UseGuards(ApiKeyGuard, RateLimitGuard)
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly createUC: CreateSessionUC,
    private readonly renameUC: RenameSessionUC,
    private readonly favUC: FavoriteSessionUC,
    private readonly deleteUC: DeleteSessionUC,
    private readonly listUC: ListSessionsUC,
  ) {}

  @Post()
  create(@Body() dto: StartSessionDto) {
    return this.createUC.execute(dto);
  }

  @Patch(':id/rename')
  rename(@Param('id') id: string, @Body() dto: RenameSessionDto, @Query('userId') userId: string) {
    return this.renameUC.execute({ id, userId, title: dto.title });
  }

  @Patch(':id/favorite')
  favorite(@Param('id') id: string, @Body() dto: ToggleFavoriteDto, @Query('userId') userId: string) {
    return this.favUC.execute({ id, userId, favorite: dto.favorite });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.deleteUC.execute({ id, userId });
  }

  @Get()
  list(
    @Query('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.listUC.execute({ userId, page, pageSize });
  }
}
