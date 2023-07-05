import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';
export class CreateCustomerDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  username: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
  @ApiProperty()
  name: string;
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  address: string;
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  businessAreas: string;
  @IsNumber()
  @ApiProperty()
  @IsNotEmpty()
  teamId: number;
  isEmailLogin: boolean;
}
