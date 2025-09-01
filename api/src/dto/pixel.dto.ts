import { ApiProperty, OmitType } from '@nestjs/swagger';

export class PixelDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  img: string;
  @ApiProperty()
  label: string;
  @ApiProperty()
  timestamp: number;
}

export class CreatePixelDto extends OmitType(PixelDto, ['id', 'timestamp']) {}
