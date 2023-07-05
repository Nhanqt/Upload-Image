import { ApiProperty } from '@nestjs/swagger';

export class UpdateBranchDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  branchName: string;
  @ApiProperty()
  status: boolean;
}
