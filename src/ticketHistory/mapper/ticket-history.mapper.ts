import { AccountEntity } from 'src/account/entity/account.entity';
import { ChangeStatusDto } from 'src/ticket/dto/changeStatus.dto';
import { TicketEnums } from 'src/ticket/dto/create-ticket.dto';
import { TicketEntity } from 'src/ticket/entity/ticket.entity';
import { RatingDto } from 'src/ticketAssign/dto/rating.dto';
import { AssignTicketDto } from 'src/ticketAssign/dto/ticket-assign.dto';
import { TicketHistoryEntity } from '../entity/tickethistory.entity';

export class TicketHistoryMapper {
  async fromAssignTicketToTicketHistoryEntity(dto: AssignTicketDto) {
    const ticketHistoryEntity = new TicketHistoryEntity();
    const ticketEntity = new TicketEntity();
    ticketEntity.id = dto.ticketId;
    ticketHistoryEntity.ticket = ticketEntity;
    const account = new AccountEntity();
    account.id = dto.assignor;
    ticketHistoryEntity.account = account;
    ticketHistoryEntity.status = TicketEnums.APPROVE;
    return ticketHistoryEntity;
  }

  async fromChangeStatusDtoToEntity(dto: ChangeStatusDto) {
    const ticketHistoryEntity = new TicketHistoryEntity();
    const ticketEntity = new TicketEntity();
    ticketEntity.id = dto.ticketId;
    ticketHistoryEntity.ticket = ticketEntity;
    const account = new AccountEntity();
    account.id = dto.accountId;
    ticketHistoryEntity.account = account;
    ticketHistoryEntity.status = dto.status;
    if (dto.note != null) {
      ticketHistoryEntity.note = dto.note;
    }
    return ticketHistoryEntity;
  }

  async ratingDtoToEntity(dto: RatingDto) {
    const ticketHistoryEntity = new TicketHistoryEntity();
    const ticketEntity = new TicketEntity();
    ticketEntity.id = dto.ticketId;
    ticketHistoryEntity.ticket = ticketEntity;
    const account = new AccountEntity();
    account.id = dto.accountId;
    ticketHistoryEntity.account = account;
    ticketHistoryEntity.status = TicketEnums.COMPLETE;
    return ticketHistoryEntity;
  }
}
