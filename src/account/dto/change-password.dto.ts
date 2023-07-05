import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ChangePasswordDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  old_password?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  new_password?: string;
}
