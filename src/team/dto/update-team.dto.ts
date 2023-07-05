import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  teamName: string;
  @ApiProperty()
  branchId: number;
}
