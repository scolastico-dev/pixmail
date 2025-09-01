import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth.guard';
import { LogDto } from 'src/dto/log.dto';
import { DbService } from 'src/services/db.service';

@Controller('log')
@ApiTags('log')
export class LogReadController {
  constructor(private readonly db: DbService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pixel', required: false, type: String })
  @ApiOkResponse({ description: 'List of logs', type: LogDto })
  async getLogs(
    @Query('page') page = 0,
    @Query('pixel') pixel?: string,
  ): Promise<LogDto[]> {
    return this.db.getLogs(Number(page), pixel);
  }
}
