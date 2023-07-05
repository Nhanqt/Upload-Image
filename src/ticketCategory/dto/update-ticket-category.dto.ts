import { ApiProperty } from '@nestjs/swagger';

export class UpdateTicketCategory {
  @ApiProperty()
  id: number;
  @ApiProperty()
  category: string;
  @ApiProperty()
  isRelation: boolean;
}
