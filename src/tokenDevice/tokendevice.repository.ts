import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { TokenDeviceEntity } from 'src/tokenDevice/entity/tokendevice.entity';
import { Repository } from 'typeorm';

@CustomRepository(TokenDeviceEntity)
export class TokenDeviceRepository extends Repository<TokenDeviceEntity> {
  async findTokenDevice(ticketId: number) {
    const data = await this.query(
      `select td."token" from ticket t 
      join account a on t."accountId" = a.id 
      join "customerAccount" ca on ca."accountId" = a.id 
      join customer c on ca."customerId" = c.id 
      join team t2 on c."teamId" = t2.id 
      join employee e on t2.id = e."teamId" 
      join account a2 on a2.id = e."accountId" 
      join "tokenDevice" td on a2.id = td."accountId" 
      where t.id = ${ticketId}`,
    );
    return data;
  }

  async findTokenDeviceForCustomer(ticketid: number){
    return await this.query(`select td."token" from ticket t 
    join account a on t."accountId" = a.id 
    join "customerAccount" ca on ca."accountId" = a.id 
    join customer c on ca."customerId" = c.id 
    join "tokenDevice" td on a.id = td."accountId" 
    where t.id = ${ticketid}`)
  }
}
