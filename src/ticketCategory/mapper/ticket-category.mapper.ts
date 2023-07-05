import {
  CreateTicketCategory,
  PagedTicketCategory,
  UpdateTicketCategory,
} from '../dto';
import { TicketCategoryEntity } from '../entity/ticketcategory.entity';
export class TicketCategoryMapper {
  dtoToEntityTicketCreate(dto: CreateTicketCategory) {
    const entity = new TicketCategoryEntity();
    entity.isRelativeToContract = dto.isRelation;
    entity.category = dto.category;
    return entity;
  }
  dtoToEntityTicketUpdate(dto: UpdateTicketCategory) {
    const entity = new TicketCategoryEntity();
    entity.id = dto.id;
    entity.isRelativeToContract = dto.isRelation;
    entity.category = dto.category;
    return entity;
  }
  async listEntityToListDtoTicketPaged(lists: TicketCategoryEntity[]) {
    const list = [];
    for await (const x of lists) {
      const dto = new PagedTicketCategory();
      dto.id = x.id;
      dto.isRelation = x.isRelativeToContract;
      dto.category = x.category;
      list.push(dto);
    }
    return list;
  }
}
