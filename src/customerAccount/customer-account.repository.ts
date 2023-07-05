import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { Repository, Not, Raw } from 'typeorm';
import { CustomerAccountEntity } from './entity/customerAccount.entity';

@CustomRepository(CustomerAccountEntity)
export class CustomerAccountRepository extends Repository<CustomerAccountEntity> {
  public async createCustomer(entity: CustomerAccountEntity) {
    return await this.save(entity);
  }
  public async findOneCustomerByEmailExceptId(email: string, id: number) {
    return await this.findOne({
      where: { customer: { id: Not(id), email: email } },
    });
  }
  public async findOneCustomerByPhoneExceptId(phone: string, id: number) {
    return await this.findOne({
      where: { customer: { id: Not(id), phone: phone } },
    });
  }

  public async getCustomerByIdUpdate(id: number) {
    return await this.findOne({
      relations: ['account', 'customer'],
      where: { customer: { id: id } },
    });
  }
  public async UpdateCustomer(
    oldData: CustomerAccountEntity,
    newData: CustomerAccountEntity,
  ) {
    return await this.save({
      ...oldData,
      ...newData,
    });
  }
  public async UpdateStatusCustomer(newData: CustomerAccountEntity) {
    return await this.save(newData);
  }
  public async paged(
    take: number,
    skip: number,
    nameSearch: string,
    emailSearch: string,
    teamName: string,
    branchNameSearch: string,
    status: string,
  ) {
    if (status) {
      const isStatus = status === 'true' ? true : false;

      return await this.findAndCount({
        take,
        skip,
        relations: { account: true, customer: { team: { branch: true } } },
        where: {
          customer: {
            name: nameSearch
              ? Raw(
                  (alias) =>
                    `LOWER(${alias}) Like '%${nameSearch.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            email: emailSearch
              ? Raw(
                  (alias) =>
                    `LOWER(${alias}) Like '%${emailSearch.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            team: {
              teamName: teamName
                ? Raw(
                    (alias) => `LOWER(${alias}) = '${teamName.toLowerCase()}'`,
                  )
                : Raw((alias) => `${alias} Like '%%'`),
              branch: {
                branchName: branchNameSearch
                  ? Raw(
                      (alias) =>
                        `LOWER(${alias}) = '${branchNameSearch.toLowerCase()}'`,
                    )
                  : Raw((alias) => `${alias} Like '%%'`),
              },
            },
          },
          account: {
            status: isStatus,
          },
        },
        order: {
          id: 'DESC',
        },
      });
    } else {
      return await this.findAndCount({
        take,
        skip,
        relations: { account: true, customer: { team: { branch: true } } },
        where: {
          customer: {
            name: nameSearch
              ? Raw(
                  (alias) =>
                    `LOWER(${alias}) Like '%${nameSearch.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            email: emailSearch
              ? Raw(
                  (alias) =>
                    `LOWER(${alias}) Like '%${emailSearch.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            team: {
              teamName: teamName
                ? Raw(
                    (alias) => `LOWER(${alias}) = '${teamName.toLowerCase()}'`,
                  )
                : Raw((alias) => `${alias} Like '%%'`),
              branch: {
                branchName: branchNameSearch
                  ? Raw(
                      (alias) =>
                        `LOWER(${alias}) = '${branchNameSearch.toLowerCase()}'`,
                    )
                  : Raw((alias) => `${alias} Like '%%'`),
              },
            },
          },
        },
        order: {
          id: 'DESC',
        },
      });
    }
  }

  async findCustomerAccountByTeam(teamId: number) {
    return await this.find({
      relations: { account: true, customer: true },
      where: {
        customer: {
          team: {
            id: teamId,
          },
        },
      },
    });
  }
}
