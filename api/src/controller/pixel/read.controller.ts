import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth.guard';
import { PixelDto } from 'src/dto/pixel.dto';
import { DbService } from 'src/services/db.service';

@Controller('pixel')
@ApiTags('pixel')
export class PixelReadController {
  constructor(private readonly db: DbService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiOkResponse({ description: 'List of pixels', type: PixelDto })
  async getPixels(@Query('page') page = 0): Promise<PixelDto[]> {
    return this.db.getPixels(Number(page));
  }
}
