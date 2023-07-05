import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  branchName: string;
}
