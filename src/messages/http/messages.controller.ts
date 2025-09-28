import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiKeyGuard } from '../../common/guard/api-key.gaurd';
import { RateLimitGuard } from '../../common/guard/rate-limit.gaurd';
import { AddMessageDto } from '../dto';
import { AddMessageUC, DeleteMessageUC, ListMessagesUC } from '../application/usecases';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('messages')
@ApiSecurity('apiKey')
@UseGuards(ApiKeyGuard, RateLimitGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly addUC: AddMessageUC,
    private readonly listUC: ListMessagesUC,
    private readonly delUC: DeleteMessageUC,
  ) {}

  @Post()
  add(@Body() dto: AddMessageDto) {
    return this.addUC.execute(dto);
  }

  @Get()
  list(
    @Query('sessionId') sessionId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize: number,
  ) {
    return this.listUC.execute({ sessionId, page, pageSize });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.delUC.execute({ id });
  }
}
