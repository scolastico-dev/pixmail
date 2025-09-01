import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { CfgService } from 'src/services/cfg.service';
import { DbService } from 'src/services/db.service';

@Controller('get')
@ApiTags('get')
export class TrackingController {
  constructor(
    private readonly db: DbService,
    private readonly cfg: CfgService,
  ) {}

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Pixel found, returning pixel image',
  })
  async getPixel(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const pixel = await this.db.getPixel(id.split('.')[0]);
    await this.db.addLog({
      id: randomUUID(),
      ip: res.req.ip,
      label: pixel ? pixel.label : null,
      pixel: pixel ? pixel.id : null,
      timestamp: Math.floor(Date.now() / 1000),
      user_agent: res.req.headers['user-agent'] || 'unknown',
    });
    const image = pixel ? pixel.img : this.cfg.defaultPixelImage;
    const data = await axios.get(image, {
      responseType: 'arraybuffer',
    });
    res.set('Content-Type', data.headers['content-type'] || 'image/png');
    res.send(data.data);
  }
}
