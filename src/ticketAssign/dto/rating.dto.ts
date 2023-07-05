import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class RatingDto {
  @ApiProperty()
  ticketId: number;
  @ApiProperty()
  @IsNumber()
  star: number;
  @ApiProperty()
  description: string;
  accountId: number;
}
