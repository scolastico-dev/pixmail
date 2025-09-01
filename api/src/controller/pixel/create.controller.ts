import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { AuthGuard } from 'src/auth.guard';
import { CreatePixelDto, PixelDto } from 'src/dto/pixel.dto';
import { DbService } from 'src/services/db.service';

@Controller('pixel')
@ApiTags('pixel')
export class PixelCreateController {
  constructor(private readonly db: DbService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreatePixelDto })
  @ApiOkResponse({ description: 'Pixel created', type: PixelDto })
  async createPixel(@Body() pixel: CreatePixelDto): Promise<PixelDto> {
    const res: PixelDto = {
      ...pixel,
      id: randomUUID(),
      timestamp: Math.floor(Date.now() / 1000),
    };
    await this.db.addPixel(res);
    return res;
  }
}
