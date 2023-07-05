import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { TeamRoleEnum } from './../enums/employee-team-role.enums';

export class UpdateEmployeeDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;
  @IsEmail()
  @ApiProperty()
  email: string;
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  fullname: string;
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  phone: string;
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  address: string;
  @ApiProperty()
  @IsNotEmpty()
  status: string;
  @ApiProperty()
  @IsNotEmpty()
  dateOfBirth: Date;
  @IsNumber()
  @ApiProperty()
  @IsNotEmpty()
  teamId: number;
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(TeamRoleEnum)
  teamRole: string;
  @IsBoolean()
  @ApiProperty()
  @IsNotEmpty()
  sex: boolean;
}
