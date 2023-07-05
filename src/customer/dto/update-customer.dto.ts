import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
export class UpdateCustomerDto {
  @IsNumber()
  @ApiProperty()
  @IsNotEmpty()
  id: number;
  @ApiProperty()
  @IsNotEmpty()
  status: string;
  @ApiProperty()
  @IsNotEmpty()
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
}
