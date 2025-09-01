import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth.guard';
import { DbService } from 'src/services/db.service';

@Controller('pixel')
@ApiTags('pixel')
export class PixelDeleteController {
  constructor(private readonly db: DbService) {}

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Pixel deleted successfully' })
  async deletePixel(@Param('id') id: string): Promise<void> {
    await this.db.deletePixel(id);
  }
}
