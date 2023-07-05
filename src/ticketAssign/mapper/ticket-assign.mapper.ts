import { AccountEntity } from 'src/account/entity/account.entity';
import { TicketEntity } from 'src/ticket/entity/ticket.entity';
import {
  AddMoreAssign,
  AssignTicketDto,
  ChangeAssignTo,
} from '../dto/ticket-assign.dto';
import { TicketAssignEntity } from '../entity/ticketassign.entity';

export class TicketAssignMapper {
  async dtoToListTicketAssignEntity(dto: AssignTicketDto) {
    let listTicketAssignEntity = [];
    dto.assignTo.map((value) => {
      let ticketAssignEntity = new TicketAssignEntity();
      let ticketEntity = new TicketEntity();
      ticketEntity.id = dto.ticketId;
      ticketAssignEntity.ticket = ticketEntity;
      let assignor = new AccountEntity();
      assignor.id = dto.assignor;
      ticketAssignEntity.assignor = assignor;
      let assignTo = new AccountEntity();
      assignTo.id = value;
      ticketAssignEntity.assignTo = assignTo;
      listTicketAssignEntity.push(ticketAssignEntity);
    });
    return listTicketAssignEntity;
  }

  async addMoreDtoToAssignEntity(dto: AddMoreAssign) {
    let entity = new TicketAssignEntity();
    entity.assignAt = new Date();
    let ticket = new TicketEntity();
    ticket.id = dto.ticketId;
    entity.ticket = ticket;
    let assignor = new AccountEntity();
    assignor.id = dto.assignor;
    entity.assignor = assignor;
    let assignTo = new AccountEntity();
    assignTo.id = dto.assignTo;
    entity.assignTo = assignTo;
    return entity;
  }

  async changeAssignDtoToEntity(dto: ChangeAssignTo) {
    let entity = new TicketAssignEntity();
    entity.id = dto.ticketAssignId;
    let assignTo = new AccountEntity();
    assignTo.id = dto.assignTo;
    entity.assignTo = assignTo;
    return entity;
  }
}
