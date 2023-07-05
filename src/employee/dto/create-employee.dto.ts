import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TeamRoleEnum } from '../enums/employee-team-role.enums';
export class CreateEmployeeDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  username: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
  @ApiProperty()
  fullname: string;
  @ApiProperty()
  sex: boolean;
  @IsString()
  @ApiProperty()
  @IsEnum(TeamRoleEnum)
  teamRole: string;
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsString()
  phone: string;
  @ApiProperty()
  @IsString()
  address: string;
  @ApiProperty()
  dateOfBirth: Date;
  @ApiProperty()
  teamId: number;
  isEmailLogin: boolean;
}
