import { ContractEntity } from './../../contract/entity/contract.entity';
import { AccountEntity } from 'src/account/entity/account.entity';
import { TicketEntity } from 'src/ticket/entity/ticket.entity';
import {
  CreateTicketDto,
  PriorityEnums,
  TicketEnums,
} from './../dto/create-ticket.dto';
import { TicketDetailDto } from '../dto/ticket-detail.dto';
import { TicketService } from '../ticket.service';
import { TicketAssignEntity } from 'src/ticketAssign/entity/ticketassign.entity';
import { TicketTypeEnum } from 'src/service/enums/service-enums';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { TicketCategoryEntity } from 'src/ticketCategory/entity/ticketcategory.entity';
export class TicketMapper {
  private readonly ticketService: TicketService;
  constructor(ticketService: TicketService) {
    this.ticketService = ticketService;
  }
  dtoToEntityTicket(dto: CreateTicketDto) {
    const entity = new TicketEntity();
    entity.subject = dto.subject;
    entity.description = dto.description;
    entity.priority = PriorityEnums.LOW;
    entity.createAt = new Date();
    entity.sendFrom = dto.sendFrom;
    entity.status = TicketEnums.PENDING;
    const account = new AccountEntity();
    account.id = dto.accountId;
    entity.account = account;
    const service = new ServiceEntity();
    service.id = dto.serviceId;
    entity.service = service;
    const ticketCategory = new TicketCategoryEntity();
    ticketCategory.id = dto.ticketCategoryId;
    entity.ticketCategory = ticketCategory;

    return entity;
  }

  entityToDtoTicket(entity: TicketEntity) {
    const createTicketDto = new CreateTicketDto();
    createTicketDto.ticketId = entity.id;
    return createTicketDto;
  }

  async fromTicketEntityToTicketList(listTicketEntity: TicketEntity[]) {
    const ticketDetail: TicketDetailDto[] = [];
    await Promise.all(
      listTicketEntity.map(async (item) => {
        const customerNameAndTeam =
          await this.ticketService.getCustomerNameAndTeamId(item.id);
        const assignorName = await this.ticketService.getNameAssignor(item.id);
        const assigntoName = await this.ticketService.getNameAssignTo(item.id);
        const serviceName = await this.ticketService.getServiceName(item.id)
        const getTicketCategory = await this.ticketService.getTicketCategory(
          item.id,
        );
        const ticket = new TicketDetailDto();
        ticket.ticketid = item.id;
        ticket.subject = item.subject;
        ticket.description = item.description;
        ticket.priority = item.priority;
        ticket.expectedTimeComplete = item.expectedTimeComplete;
        ticket.createAt = item.createAt;
        ticket.sendFrom = item.sendFrom;
        //get ticket category
        ticket.ticketCategoryid = getTicketCategory[0].ticketcategoryid;
        ticket.category = getTicketCategory[0].category;
        ticket.isRelativeToContract = getTicketCategory[0].isRelativeToContract;
        //get service name
        ticket.serviceName = serviceName[0].serviceName
        ticket.status = item.status;
        ticket.name = customerNameAndTeam[0].customername;
        ticket.teamid = customerNameAndTeam[0].teamid;
        ticket.teamName = customerNameAndTeam[0].teamName;
        ticket.assignor = assignorName;
        ticket.asignto = assigntoName;
        ticketDetail.push(ticket);
      }),
    );
    ticketDetail.sort(function (a, b) {
      return b.ticketid - a.ticketid;
    });
    return ticketDetail;
  }
}
