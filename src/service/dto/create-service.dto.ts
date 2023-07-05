import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty()
  serviceName: string;
  @ApiProperty()
  description: string;
}
