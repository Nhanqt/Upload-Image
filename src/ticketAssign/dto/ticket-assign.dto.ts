import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class AssignTicketDto {
  @ApiProperty()
  @IsNumber()
  ticketId: number;
  assignor: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  assignTo: number[];
  @ApiProperty()
  @IsNotEmpty()
  expectedTimeComplete: Date;
  @ApiProperty()
  priority: string;
}

export class AddMoreAssign {
  @ApiProperty()
  @IsNumber()
  ticketId: number;
  assignor: number;
  @ApiProperty()
  @IsNumber()
  assignTo: number;
}

export class ChangeAssignTo {
  @ApiProperty()
  @IsNumber()
  ticketAssignId: number;
  @ApiProperty()
  @IsNumber()
  assignTo: number;
}
