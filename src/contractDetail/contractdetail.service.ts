/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/account/entity/account.entity';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { Repository } from 'typeorm';
import { ContractDetailEntity } from './entity/contractDetail.entity';
import { AccountMessageEnum } from 'src/account/enums/account-error-enums';
import { AccountRepository } from 'src/account/account.repository';

@Injectable()
export class ContractDetailService {
  constructor(
    @InjectRepository(ContractDetailEntity)
    private readonly contractDetailRepo: Repository<ContractDetailEntity>,
    @InjectRepository(CustomerEntity)
    private readonly cusRepo: Repository<CustomerEntity>,
    private readonly accountRepo: AccountRepository,
  ) {}

  async checkCustomerExist(customerId: number) {
    const customer = await this.cusRepo.findOne({
      where: {
        id: customerId,
      },
    });
    if (!customer) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Khách hàng không tồn tại!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllByCustomer(customerId: number) {
    await this.checkCustomerExist(customerId);

    const result = await this.contractDetailRepo.find({
      relations: { contract: true, service: true },
      where: {
        contract: {
          customer: {
            id: customerId,
          },
        },
      },
    });
    return result;
  }

  async getAllActiveByCustomer(customerId: number, accountId: number) {
    await this.checkCustomerExist(customerId);
    const result = await this.contractDetailRepo.find({
      relations: { contract: true, service: true },
      where: {
        contract: {
          customer: {
            id: customerId,
          },
          status: true,
        },
      },
    });
    return result;
  }
}
