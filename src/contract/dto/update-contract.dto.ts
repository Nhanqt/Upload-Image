import { ApiProperty } from '@nestjs/swagger';

export class UpdateContractDto {
  @ApiProperty()
  contractId: number;
  @ApiProperty()
  contractCode: string;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  endDate: Date;
  @ApiProperty()
  url: string;
  @ApiProperty()
  serviceId: number[];
}
