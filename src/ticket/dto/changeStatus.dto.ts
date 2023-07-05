import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TicketEnums } from './create-ticket.dto';

export class ChangeStatusDto {
  @ApiProperty()
  ticketId: number;
  @ApiProperty()
  @IsEnum(TicketEnums)
  status: string;
  accountId: number;
  @ApiProperty({ nullable: true })
  note: string;
}
