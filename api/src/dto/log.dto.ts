import { ApiProperty } from '@nestjs/swagger';

export class LogDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  pixel: string | null;
  @ApiProperty()
  label: string | null;
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  user_agent: string;
  @ApiProperty()
  ip: string;
}
