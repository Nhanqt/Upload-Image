import { Repository } from 'typeorm';
import { TicketAssignEntity } from 'src/ticketAssign/entity/ticketassign.entity';
import { CustomRepository } from 'src/customRepository/typeorm.decorator';

@CustomRepository(TicketAssignEntity)
export class TicketAssignRepository extends Repository<TicketAssignEntity> {
  async findByTicketId(ticketId: number) {
    return await this.query(
      `select ta.id as ticketAssignId, a.id as assignToId, e.fullname 
                from "ticketAssign" ta join account a on ta."assignToId" = a.id 
                     join employee e on e."accountId" = a.id 
                where ta."ticketId" = ${ticketId}`,
    );
  }

  async getListRating() {
    return await this
      .query(`select avg(ta."ratingStar"),a.id, e.fullname  from "ticketAssign" ta  
    join account a on a.id = ta."assignToId" 
    join employee e on e."accountId" = a.id 
    where "ratingStatus" = true
    group by a.id , e.fullname `);
  }

  async findAndCountByEmployeeAcountAndStatus(
    accountId: number,
    status: string,
  ) {
    return await this.count({
      where: {
        ticket: {
          status: status,
        },
        assignTo: {
          id: accountId,
        },
      },
    });
  }

  async findByEmployeeAndStatusAndPaging(
    accountId: number,
    status: string,
    offset: number,
    numOfTicket: number,
  ) {
    return await this
      .query(`select t.id as ticketId,t.subject ,t.description , tc.category as ticketType ,t.priority ,t."expectedTimeComplete",t."createAt" ,t.status , s."serviceName",c.address,c.phone ,
      c.name as customerName, ta.id as ticketAssignId 
       from ticket t join "customerAccount" ca on t."accountId" = ca."accountId" 
                join customer c on c.id = ca."customerId" 
                join "ticketAssign" ta on ta."ticketId" = t.id 
                join "ticketCategory" tc on tc.id  = t."ticketCategoryId" 
                join service s on t."serviceId" = s.id 
       where ta."assignToId"  = ${accountId} and t.status = '${status}'  
       order by t.id desc 
       OFFSET ${offset} ROWS 
       FETCH FIRST ${numOfTicket} ROW ONLY`);
  }

  async findByEmployeeAccountNoPaging(accountId: number, status: string) {
    return await this
      .query(`select t.id as ticketId,t.subject ,t.description , tc.category as ticketType ,t.priority ,t."expectedTimeComplete",t."createAt" ,t.status , s."serviceName",c.address,c.phone ,
      c.name as customerName, ta.id as ticketAssignId 
       from ticket t join "customerAccount" ca on t."accountId" = ca."accountId" 
                join customer c on c.id = ca."customerId" 
                join "ticketAssign" ta on ta."ticketId" = t.id 
                join "ticketCategory" tc on tc.id  = t."ticketCategoryId" 
                join service s on t."serviceId" = s.id 
      where ta."assignToId"  = ${accountId} and t.status = '${status}'  
      order by t.id desc`);
  }

  async findById(id: number) {
    return await this.find({
      where: {
        id: id,
      },
    });
  }

  async deleteAssigned(id: number) {
    return await this.delete({
      id: id,
    });
  }

  async deleteAssignByTicketIdAndAssignor(
    ticketid: number,
    assignToid: number,
  ) {
    return await this.query(`
    DELETE FROM "ticketAssign" 
WHERE "ticketId" = ${ticketid} and "assignToId" = ${assignToid}
    `);
  }

  async updateTicketAssign(entity: TicketAssignEntity) {
    const assignTo = entity.assignTo;
    const id = entity.id;
    return await this.update(
      {
        id,
      },
      { assignTo },
    );
  }

  async findByTicketIdAndAssignToId(ticketId: number, assignToId: number) {
    return await this.find({
      where: {
        ticket: {
          id: ticketId,
        },
        assignTo: {
          id: assignToId,
        },
      },
    });
  }

  async getPersonalRating(accountId: number) {
    return await this.query(
      `select count(ta.id), round(avg("ratingStar") ,1)
      from "ticketAssign" ta join employee e on ta."assignToId" = e."accountId" 
      where "ratingStatus" = true and "assignToId" = ${accountId} `,
    );
  }

  async getPersonalRatingList(accountId: number) {
    return await this.query(
      `select ta.id ,round("ratingStar",1) as star , "ratingAt" , "ratingDescription" , c."name" 
          from "ticketAssign" ta join ticket t on ta."ticketId" = t.id 
                    join "customerAccount" ca on ca."accountId" = t."accountId" 
                    join customer c on ca."customerId" = c.id 
          where "ratingStatus" = true and "assignToId" = ${accountId}
          order by ta.id desc`,
    );
  }
}
