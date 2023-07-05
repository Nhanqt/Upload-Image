import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TeamRoleEnum } from '../enums/employee-team-role.enums';

export class UpdateTeamRoleDto {
  @ApiProperty()
  empId: number;
  @ApiProperty()
  @IsEnum(TeamRoleEnum)
  roleName: string;
}
