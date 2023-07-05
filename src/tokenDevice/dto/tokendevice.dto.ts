import { ApiProperty } from '@nestjs/swagger';

export class TokenDeviceDto {
  @ApiProperty()
  token: string;
  accountid: number;
}
