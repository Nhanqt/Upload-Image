import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateTeamDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  teamName: string;
  @IsNumber()
  @ApiProperty()
  branchId: number;
}
