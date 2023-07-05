import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketCategory {
  @ApiProperty()
  category: string;
  @ApiProperty()
  isRelation: boolean;
}
