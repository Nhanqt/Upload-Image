import { ApiProperty } from '@nestjs/swagger';

export class UpdateServiceDto {
  @ApiProperty()
  serviceId: number;
  @ApiProperty()
  serviceName: string;
  @ApiProperty()
  description: string;
}
