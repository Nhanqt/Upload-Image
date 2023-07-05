import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { LessThanOrEqual, MoreThanOrEqual, Raw, Repository } from 'typeorm';
import { ContractEntity } from './entity/contract.entity';

@CustomRepository(ContractEntity)
export class ContractRepository extends Repository<ContractEntity> {
  async getInfoOfExpireContract() {
    const result = await this.query(`
    select c.id as contractid ,c2.email , s."serviceName", c."endDate" - current_date as expertContract, c2.name, c.id as customerId, s.id as serviceId, c."endDate" ,c."contractCode" as contractCode
    from contract c 
    join customer c2 on c."customerId" = c2.id 
    join "contractDetail" cd on c.id = cd."contractId" 
    join service s on s.id = cd."serviceId" 
    where (c."endDate" - current_date) = '30 days' or (c."endDate" - current_date) = '20 days' or (c."endDate" - current_date) = '10 days' or (c."endDate" - current_date) = '0 days'
    `);
    return result;
  }

  async deactiveContract(contractid: number) {
    return await this.query(`UPDATE contract 
    SET status = false
    WHERE id = ${contractid}`);
  }

  async getListContractExpired() {
    return await this.query(`select c.id as contractid 
    from contract c 
    where (c."endDate" - current_date) = '0 days'`);
  }

  public async getContractByCustomerId(customerId: number) {
    return await this.find({
      where: {
        customer: {
          id: customerId,
        },
      },
    });
  }
  public async findAllContract() {
    return await this.find();
  }
  public async findOneContractById(id: number) {
    return await this.findOne({
      relations: { contractDetail: { service: true, contract: true } },
      where: {
        id: id,
      },
    });
  }
  isBoolean = (val: any) => 'boolean' === typeof val;
  isUndefined = (val: any) => 'undefined' === typeof val;
  public async paged(
    take: number,
    skip: number,
    name: string,
    email: string,
    contractCode: string,
    contractId: number[],
    startDate: string | Date,
    endDate: string | Date,
    status: string | boolean,
  ) {
    const isSearchService = this.isUndefined(contractId);
    let checkIdContract = undefined;
    if (!isSearchService) {
      checkIdContract = !contractId.length;
    }
    let isStatus = undefined;
    if (!this.isBoolean(status) && !this.isUndefined(status)) {
      isStatus = status === 'true' ? true : false;
    } else isStatus = status;
    if (startDate && endDate) {
      return await this.findAndCount({
        relations: {
          customer: {
            team: { branch: true },
            customerAccount: { account: true },
          },
          contractDetail: { service: true },
        },
        where: {
          startDate: MoreThanOrEqual(new Date(startDate)),
          endDate: LessThanOrEqual(new Date(endDate)),
          customer: {
            name: name
              ? Raw(
                  (alias) =>
                    `LOWER(${alias}) LIKE '%${name.trim().toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} LIKE '%%'`),
            email: email
              ? Raw(
                  (alias) =>
                    `LOWER(${alias}) LIKE '%${email.trim().toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} LIKE '%%'`),
          },
          id:
            checkIdContract === false
              ? Raw((alias) => `${alias} IN (${contractId})`)
              : checkIdContract
              ? Raw((alias) => `${alias} = -1`)
              : Raw((alias) => `${alias} > -1`),

          contractCode: contractCode
            ? Raw(
                (alias) =>
                  `LOWER(${alias}) LIKE '%${contractCode
                    .trim()
                    .toLowerCase()}%'`,
              )
            : Raw((alias) => `${alias} LIKE '%%'`),
          status: status
            ? Raw((alias) => `${alias} = '${isStatus}'`)
            : Raw((alias) => `${alias} IN ('true','false')`),
        },
        take,
        skip,
        order: {
          id: 'DESC',
        },
      });
    } else {
      return await this.findAndCount({
        relations: {
          customer: {
            team: { branch: true },
            customerAccount: { account: true },
          },
          contractDetail: { service: true },
        },
        where: {
          customer: {
            name: name
              ? Raw(
                  (alias) =>
                    `LOWER(${alias}) LIKE '%${name.trim().toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} LIKE '%%'`),
            email: email
              ? Raw(
                  (alias) =>
                    `LOWER(${alias}) LIKE '%${email.trim().toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} LIKE '%%'`),
          },

          id:
            checkIdContract === false
              ? Raw((alias) => `${alias} IN (${contractId})`)
              : checkIdContract
              ? Raw((alias) => `${alias} = -1`)
              : Raw((alias) => `${alias} > -1`),
          contractCode: contractCode
            ? Raw(
                (alias) =>
                  `LOWER(${alias}) LIKE '%${contractCode
                    .trim()
                    .toLowerCase()}%'`,
              )
            : Raw((alias) => `${alias} LIKE '%%'`),
          status: status
            ? Raw((alias) => `${alias} = '${isStatus}'`)
            : Raw((alias) => `${alias} IN ('true','false')`),
        },
        take,
        skip,
        order: {
          id: 'DESC',
        },
      });
    }
  }
  public async pagedByCustomerId(
    take: number,
    skip: number,
    customerId: number,
    contractCode: string,
    contractId: number[],
    startDate: string | Date,
    endDate: string | Date,
    status: string | boolean,
  ) {
    const isSearchService = this.isUndefined(contractId);
    let checkIdContract = undefined;
    if (!isSearchService) {
      checkIdContract = !contractId.length;
    }
    let isStatus = undefined;
    if (!this.isBoolean(status) && !this.isUndefined(status)) {
      isStatus = status === 'true' ? true : false;
    } else isStatus = status;
    if (startDate && endDate) {
      return await this.findAndCount({
        relations: {
          customer: {
            team: { branch: true },
            customerAccount: { account: true },
          },
          contractDetail: { service: true },
        },
        where: {
          startDate: MoreThanOrEqual(new Date(startDate)),
          endDate: LessThanOrEqual(new Date(endDate)),
          customer: {
            id: customerId,
          },
          id:
            checkIdContract === false
              ? Raw((alias) => `${alias} IN (${contractId})`)
              : checkIdContract
              ? Raw((alias) => `${alias} = -1`)
              : Raw((alias) => `${alias} > -1`),

          contractCode: contractCode
            ? Raw(
                (alias) =>
                  `LOWER(${alias}) LIKE '%${contractCode
                    .trim()
                    .toLowerCase()}%'`,
              )
            : Raw((alias) => `${alias} LIKE '%%'`),
          status: status
            ? Raw((alias) => `${alias} = '${isStatus}'`)
            : Raw((alias) => `${alias} IN ('true','false')`),
        },
        take,
        skip,
        order: {
          id: 'DESC',
        },
      });
    } else {
      return await this.findAndCount({
        relations: {
          customer: {
            team: { branch: true },
            customerAccount: { account: true },
          },
          contractDetail: { service: true },
        },
        where: {
          customer: {
            id: customerId,
          },

          id:
            checkIdContract === false
              ? Raw((alias) => `${alias} IN (${contractId})`)
              : checkIdContract
              ? Raw((alias) => `${alias} = -1`)
              : Raw((alias) => `${alias} > -1`),

          contractCode: contractCode
            ? Raw(
                (alias) =>
                  `LOWER(${alias}) LIKE '%${contractCode
                    .trim()
                    .toLowerCase()}%'`,
              )
            : Raw((alias) => `${alias} LIKE '%%'`),
          status: status
            ? Raw((alias) => `${alias} = '${isStatus}'`)
            : Raw((alias) => `${alias} IN ('true','false')`),
        },
        take,
        skip,
        order: {
          id: 'DESC',
        },
      });
    }
  }
  async findServiceExistInContract(accountId: number, serviceId: number) {
    return this.query(`select count(s.id)
     from "customerAccount" ca join customer c on ca."customerId" = c.id 
            join contract c2 on c2."customerId" = c.id 
            join "contractDetail" cd on c2.id  = cd."contractId" 
            join service s on cd."serviceId"  = s.id 
     where s.id = ${serviceId} and ca."accountId" = ${accountId} and s.status = true`);
  }
}
