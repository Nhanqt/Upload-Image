import { ApiProperty } from '@nestjs/swagger';

export class PagedTicketCategory {
  @ApiProperty()
  id: number;
  @ApiProperty()
  category: string;
  @ApiProperty()
  isRelation: boolean;
}
