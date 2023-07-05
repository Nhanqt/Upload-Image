import { ApiProperty } from '@nestjs/swagger';

export class CreateContractRequest {
  id: number;
  @ApiProperty()
  contractCode: string;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  endDate: Date;
  @ApiProperty()
  folderContractUrl: string;
  createAt: Date;
  status: boolean;
  @ApiProperty()
  customerId: number;
  @ApiProperty()
  serviceId: number[];

  
}
