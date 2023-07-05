import { In, Repository } from 'typeorm';
import { TicketEntity } from 'src/ticket/entity/ticket.entity';
import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AssignEnums } from 'src/ticketAssign/enum/ticket-assign-enum';
import { TicketEnums } from './dto/create-ticket.dto';
import { AccountEntity } from 'src/account/entity/account.entity';
import multer from 'multer';

@CustomRepository(TicketEntity)
export class TicketRepository extends Repository<TicketEntity> {
  async checkExistTicket(id: number) {
    const check = await this.findOne({
      where: {
        id: id,
      },
    });
    if (!check) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: AssignEnums.TICKET_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return check;
  }

  async getServiceName(ticketid: number) {
    return await this.query(`select s."serviceName" from ticket t 
    join service s ON s.id = t."serviceId" 
    where t.id = ${ticketid}`);
  }

  async totalTicketBySourceEveryMonth(time: string) {
    return await this
      .query(`select count(t.id) as numberOfTicket,DATE_TRUNC('${time}',t."createAt") AS  ticket_time, t."sendFrom"
    from ticket t
    group by DATE_TRUNC('${time}',t."createAt"), t."sendFrom" 
    order by t."sendFrom"  `);
  }

  async totalOfTicketByTeamEveryMonth(time: string) {
    return await this
      .query(`select count(t.id) as numberOfTicket,DATE_TRUNC('${time}',t."createAt") AS  ticket_time, t2."teamName" 
    from ticket t
    join account a on t."accountId" = a.id 
    join "customerAccount" ca on ca."accountId" = a.id
    join customer c on ca."customerId" = c.id 
    join team t2 on c."teamId" = t2.id 
    where t.status != 'Đã hủy'
    group by DATE_TRUNC('${time}',t."createAt"),t2."teamName"
    order by t2."teamName" `);
  }
  async numberOfTicketCompleteEveryMonthByEmployee(time: string) {
    return await this
      .query(`select count(t.id) as numberOfTicket,DATE_TRUNC('${time}',t."createAt") AS  ticket_time, e.fullname
    from ticket t
    join "ticketAssign" ta on ta."ticketId" = t.id
    join account a on ta."assignToId" = a.id
    join employee e on a.id = e."accountId"
    where t.status = 'Hoàn thành'
    group by DATE_TRUNC('${time}',t."createAt"), e.fullname
    order by e.fullname  `);
  }

  async numberOfServiceEveryMonth(time: string) {
    return await this
      .query(`select count(t.id) as numberOfTicket,DATE_TRUNC('${time}',t."createAt") AS  ticket_time, s."serviceName"
      from ticket t
      join service s on t."serviceId" = s.id   
      group by DATE_TRUNC('${time}',t."createAt"), s."serviceName"
      order by s."serviceName"`);
  }

  async numberOfTicketEveryMonth(time: string) {
    return await this.query(`
    select count(t.id) as numberOfTicket,DATE_TRUNC('${time}',t."createAt") AS  ticket_time, c."name"
    from ticket t
    join account a on t."accountId" = a.id 
    join "customerAccount" ca on ca."accountId" = a.id
    join customer c on ca."customerId" = c.id 
    group by DATE_TRUNC('${time}',t."createAt"), c."name" 
    order by c."name"
    
    `);
  }

  async avgTicketEveryMonthOfTeam(time: string) {
    return await this
      .query(`select avg((tp."createAt" - t."createAt") + interval '7 hour') as avgTime,DATE_TRUNC('${time}',t."createAt") AS  ticket_time, t2."teamName" 
    from ticket t
    join "ticketHistory" tp on tp."ticketId" = t.id 
    join account a on t."accountId" = a.id 
    join "customerAccount" ca on ca."accountId" = a.id
    join customer c on ca."customerId" = c.id 
    join team t2 on c."teamId" = t2.id 
    where tp.status = 'Hoàn thành'
    group by DATE_TRUNC('${time}',t."createAt"), t2."teamName"
    order by t2."teamName"`);
  }

  public async getAllTicket() {
    return await this
      .query(`select t.id, t.subject ,t.description ,t.priority ,t."expectedTimeComplete" ,t."createAt" ,t."sendFrom" ,s."serviceName" ,t.status,
      c."name", t2."teamName", t2.id as "teamid", tc.category, tc."isRelativeToContract",tc.id as ticketCategorid
      from ticket t 
      join "ticketCategory" tc on tc.id = t."ticketCategoryId"
      join service s on t."serviceId" = s.id
      join account a on a.id = t."accountId" 
      join "customerAccount" ca on ca."accountId" = a.id 
      join customer c on ca."customerId" = c.id 
      join team t2 on t2.id = c."teamId"
      order by t.id DESC`);
  }

  async getAllTicketByEmployee(teamid: number) {
    return await this
      .query(`select t.id, t.subject ,t.description ,t.priority ,t."expectedTimeComplete" ,t."createAt" ,t."sendFrom" ,t.status,
      c."name", s."serviceName" , t2."teamName", t2.id as teamid, tc.id as ticketCategorid, tc.category, tc."isRelativeToContract"
      from ticket t 
      join "ticketCategory" tc ON tc.id = t."ticketCategoryId"
      join account a on a.id = t."accountId" 
      join "customerAccount" ca on ca."accountId" = a.id 
      join service s on s.id = t."serviceId"
      join customer c on ca."customerId" = c.id 
      join team t2 on c."teamId" = t2.id 
      where t2.id = ${teamid}
      order by t.id DESC`);
  }

  async getNameAssignor(ticketid: number) {
    return await this
      .query(`select a.id as assignorid ,e.fullname as assignor from ticket t 
      join "ticketAssign" ta on ta."ticketId" = t.id 
      join account a on ta."assignorId" = a.id 
      join employee e on a.id = e."accountId" 
      where t.id = ${ticketid}
      group by a.id, e.fullname `);
  }

  async getTicketCategory(ticketid: number) {
    return await this
      .query(`select tc.id as ticketcategoryid, tc.category ,tc."isRelativeToContract"  from "ticketCategory" tc 
    join ticket t on t."ticketCategoryId" = tc.id 
    where t.id = ${ticketid}`);
  }

  async getNameAssignTo(ticketid: number) {
    return await this.query(`
    select a.id as assigntoId ,e.fullname as assignto, ta."ratingStar" , ta."ratingAt" ,ta."ratingDescription"  from ticket t 
    left join "ticketAssign" ta on ta."ticketId" = t.id 
    join account a on ta."assignToId" = a.id 
    join employee e on a.id = e."accountId" 
where t.id = ${ticketid}
    `);
  }

  async getCustomerNameAndTeamId(ticketid: number) {
    return await this
      .query(`select c."name" as customername, t2."teamName", t2.id as teamid  from ticket t 
    join account a on t."accountId" = a.id 
    join "customerAccount" ca on a.id = ca."accountId" 
    join customer c on c.id = ca."customerId" 
    join team t2 on t2.id  = c."teamId" 
    where t.id = ${ticketid}`);
  }

  async checkExistContract(contractid: number, accountid: number) {
    return await this.query(`select count(c2.id)  from customer c 
          join contract c2 on c2."customerId" = c.id 
          join "customerAccount" ca ON ca."customerId" = c.id 
          where c2.id = ${contractid} and ca."accountId" = ${accountid} and status=true`);
  }

  async getTeamIdByCustomer(accountid: number) {
    return await this.query(`
          select c."teamId" as teamid
          from ticket t 
          join account a ON a.id = t."accountId" 
          join "customerAccount" ca on ca."accountId" = a.id 
          join customer c on ca."customerId" = c.id 
          where a.id = ${accountid}
          `);
  }
  async avgTicketEveryMonthByCustomer(time: string) {
    return await this
      .query(`select avg((tp."createAt" - t."createAt") + interval '7 hour') as avgTime,DATE_TRUNC('${time}',t."createAt") AS  ticket_time, c."name"
      from ticket t
      join "ticketHistory" tp on tp."ticketId" = t.id 
      join account a on t."accountId" = a.id 
      join "customerAccount" ca on ca."accountId" = a.id
      join customer c on ca."customerId" = c.id 
      where tp.status = 'Hoàn thành'
      group by DATE_TRUNC('${time}',t."createAt"), c."name" 
      order by c."name"`);
  }

  async getTicketByTeamId(teamid: number) {
    return await this.query(`
    select t.id as ticketid,t.subject ,t.description ,t.priority ,t."expectedTimeComplete" ,t."createAt" ,
    t."sendFrom",a.id as accountid ,t.status ,a.username ,c."name" ,c.phone,c.email ,c.address ,c."businessAreas" ,c."createAt" ,c."teamId" as teamid
    from ticket t 
    join account a ON a.id = t."accountId" 
    join "customerAccount" ca on ca."accountId" = a.id 
    join customer c on ca."customerId" = c.id 
    where c."teamId" = ${teamid} and a."status" = true 
    order by t.id DESC
    `);
  }

  async getTeamIdByEmployee(accountid: number) {
    return await this.query(`
    select e."teamId" from account a 
    join employee e on e."accountId" = a.id 
    where a.id = ${accountid} and a."status" = true
      `);
  }

  async customerGetTicketByAccount(accountId: number, take: number) {
    const result = this.find({
      where: {
        account: {
          id: accountId,
        },
      },
      take: take,
      order: {
        id: 'DESC',
      },
    });
    return result;
  }

  async findByTeamAndStatus(teamId: number, status: string) {
    const result = await this.query(
      `select t.id as ticketId ,t."createAt" , t.subject ,t.description , tc.category as ticketType ,t.priority ,t."expectedTimeComplete" ,c."name" ,t.status ,c.address,c.phone ,s."serviceName"
      from  ticket t join account a on t."accountId" = a.id 
           join "customerAccount" ca on ca."accountId" = a.id 
           join customer c on c.id = ca."customerId"
           join "ticketCategory" tc on tc.id  = t."ticketCategoryId" 
           join service s on s.id = t."serviceId"
           where c."teamId" = ${teamId} and t.status = '${status}' 
           order by t.id desc `,
    );
    return result;
  }

  async findByTeamAndStatusPaging(
    teamId: number,
    status: string,
    offset: number,
    numOfTicket: number,
  ) {
    const result = await this.query(
      ` select t.id as ticketId ,t."createAt" , t.subject ,t.description , tc.category as ticketType ,t.priority ,t."expectedTimeComplete" ,c."name" ,t.status ,c.address,c.phone ,s."serviceName"
                from  ticket t join account a on t."accountId" = a.id 
                     join "customerAccount" ca on ca."accountId" = a.id 
                     join customer c on c.id = ca."customerId"
                     join "ticketCategory" tc on tc.id  = t."ticketCategoryId" 
                     join service s on s.id = t."serviceId" 
               where c."teamId" = ${teamId} and t.status = '${status}' 
               order by t.id desc 
               OFFSET ${offset} ROWS 
              FETCH FIRST ${numOfTicket} ROW ONLY
  `,
    );
    return result;
  }

  async countByTeamAndStatus(teamId: number, status: string) {
    return await this.query(`
     select count(*)
          from  ticket t join account a on t."accountId" = a.id 
          join "customerAccount" ca on ca."accountId" = a.id 
          join customer c on c.id = ca."customerId" 
          where c."teamId" = ${teamId} and t.status = '${status}' `);
  }

  async findByTicketId(ticketId: number) {
    return await this.find({
      relations: { service: true, ticketCategory: true },
      where: {
        id: ticketId,
      },
    });
  }

  async findTicketWithTicketIdAndStatus(ticketId: number, status: string[]) {
    return await this.find({
      where: {
        id: ticketId,
        status: In(status),
      },
    });
  }
}
