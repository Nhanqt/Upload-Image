import { ServiceRepository } from 'src/service/service.repository';
import { ContractDetailRepository } from './../contractDetail/contract-detail.repository';
import { CustomerRepository } from './../customer/customer.repository';
/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { paginateResponse } from 'src/middleware/paginateResponse';
import { SendMail } from 'src/utils/sendMail';
import { EntityManager } from 'typeorm';
import { ContractRepository } from './contract.repository';
import { UpdateContractDto } from './dto';
import { CreateContractRequest } from './dto/contract.dto';
import { ContractEntity } from './entity/contract.entity';
import { ContractMessageEnum } from './enums/contract.enums';
import { ContractMapper } from './mapper/contract.mapper';
import { ContractDetailEntity } from 'src/contractDetail/entity/contractDetail.entity';
import { AccountRepository } from 'src/account/account.repository';
import { AccountMessageEnum } from 'src/account/enums/account-error-enums';
@Injectable()
export class ContractService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly contractDetailRepository: ContractDetailRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly contractRepository: ContractRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly accountRepo: AccountRepository,
  ) {}
  private logger = new Logger();
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async triggerSendMail() {
    try {
      const info = await this.contractRepository.getInfoOfExpireContract();
      if (
        info[0].expertcontract.days == 30 ||
        info[0].expertcontract.days == 20 ||
        info[0].expertcontract.days == 10 ||
        Object.keys(info[0].expertcontract).length == 0
      ) {
        for (let i = 0; i < info.length; i++) {
          console.log('sending...');
          const getLocationDate = info[0].endDate;
          const convertDate = getLocationDate.toLocaleDateString('vi-VN');

          const mail = new SendMail();
          const optionMail = {
            to: info[i].email,
            subjects: 'Thông Báo Gia Hạn Hợp Đồng',
            html: `<table border="0" align="center" border="1" cellpadding="0" cellspacing="0" width="800">
            <tr>
                <td align="center" style="padding: 40px 0 30px 0;">
                    <h2>THÔNG BÁO HẠN HỢP ĐỒNG SẮP HẾT HẠN</h2>
                </td>
            </tr>
            <tr>
                <td>
                    <b>Kính chào ${info[i].name}!</b>
                    <p>Cảm ơn quý công ty đã tin tưởng sử dụng dịch vụ [${info[i].serviceName}] tại ITnow – chúng tôi rất hân hạnh
                        đươc phục vụ quý khách trong thời gian qua.</p>
                    <p>Dịch vụ đăng ký theo hợp đồng ${info[i].contractcode} của quý khách sẽ hết hạn vào ngày ${convertDate}.</p>
                    <p>Quý khách vui lòng liên hệ nhân viên kinh doanh để được hỗ trợ gia hạn.</p>
                    <p>Xin cảm ơn,</p>
                    <b>Công ty ITnow</b>
                </td>
            </tr>
    
        </table>`,
          };
          mail.sendMail(optionMail);
        }
      } else if (Object.keys(info[0].expertcontract).length == 0) {
        const expireContractId =
          await this.contractRepository.getListContractExpired();
        for (let i = 0; i < expireContractId.length; i++) {
          await this.contractRepository.deactiveContract(
            expireContractId[i].contractid,
          );
        }
      }
    } catch (error) {
      this.logger.log('Chưa có hợp đồng nào sắp hết hạn');
    }
  }
  async checkExistService(listServiceId: number[]) {
    return this.serviceRepository
      .checkExistServiceByListId(listServiceId)
      .then((values) => {
        if (values !== listServiceId.length) {
          throw new HttpException(
            {
              status: HttpStatus.NOT_FOUND,
              error: ContractMessageEnum.SERVICE_NOT_EXISTED,
            },
            HttpStatus.NOT_FOUND,
          );
        } else return false;
      });
  }
  async createContract(dto: CreateContractRequest[]) {
    for await (const x of dto) {
      await this.checkExistService(x.serviceId);
    }

    const contractMapper = new ContractMapper();
    const entity = await contractMapper.listDtoToListEntityCreate(dto);

    try {
      await this.entityManager.transaction(
        async (transactionManager: EntityManager) => {
          for await (const x of entity) {
            await transactionManager.save(x);
            await transactionManager.save(x.contractDetail);
          }
        },
      );
      return { message: ContractMessageEnum.CREATE_SUCCESS };
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: ContractMessageEnum.CREATE_ERROR,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkCustomerExist(customerId: number) {
    const customer = await this.customerRepository.findOneCustomerById(
      customerId,
    );
    if (!customer) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: ContractMessageEnum.CUSTOMER_NOT_EXISTED,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkAccount(accountId: number) {
    const account = await this.accountRepo.findByAccountId(accountId);
    if (account.length == 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: AccountMessageEnum.ACCOUNT_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      if (!account[0].status) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: AccountMessageEnum.ACCOUNT_BLOCK,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async getContractByCustomer(customerId: number, accountId: number) {
    await this.checkCustomerExist(customerId);
    await this.checkAccount(accountId);
    const listContract = await this.contractRepository.getContractByCustomerId(
      customerId,
    );
    const result = [];
    for (const value of listContract) {
      const contractDetail =
        await this.contractDetailRepository.findContractDetailById(value.id);
      const obj = { contract: value, contractDetail: contractDetail };
      result.push(obj);
    }
    return await Promise.all(result);
  }

  async getAllContract() {
    return await this.contractRepository.findAllContract();
  }

  async getContractDetail(contractId: number) {
    const contract = await this.contractRepository.findOne({
      where: {
        id: contractId,
      },
    });
    if (!contract) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: ContractMessageEnum.CONTRACT_NOT_EXISTED,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const listContractDetail =
      await this.contractDetailRepository.findContractDetailById(contractId);
    return { contract: contract, listContractDetail: listContractDetail };
  }

  async pagedContract(
    take: number,
    skip: number,
    name: string,
    email: string,
    contractCode: string,
    service: number[],
    startDate: string | Date,
    endDate: string | Date,
    status: string | boolean,
  ) {
    if (isNaN(take)) {
      take = 10;
    }
    if (isNaN(skip)) {
      skip = 1;
    }
    let listContractId = undefined;
    if (service) {
      listContractId = [];
      await this.contractDetailRepository
        .getAllContractIdContainService(service)
        .then(async (value) => {
          for await (const x of value) {
            if (listContractId.indexOf(x.contract.id) === -1) {
              listContractId.push(x.contract.id);
            }
          }
        });
    }

    const mapper = new ContractMapper();
    const res = await this.contractRepository.paged(
      take,
      skip,
      name,
      email,
      contractCode,
      listContractId,
      startDate,
      endDate,
      status,
    );
    const [data, total] = res;
    const dto = await mapper.listEntityToListDtoPaged(data);

    return paginateResponse(dto, total, skip, take);
  }
  async pagedContractByCustomerId(
    take: number,
    skip: number,
    customerId: number,
    contractCode: string,
    service: number[],
    startDate: string | Date,
    endDate: string | Date,
    status: string | boolean,
  ) {
    if (isNaN(take)) {
      take = 10;
    }
    if (isNaN(skip)) {
      skip = 1;
    }
    let listContractId = undefined;
    if (service) {
      listContractId = [];
      await this.contractDetailRepository
        .getAllContractIdContainServiceAndCustomerId(service, customerId)
        .then(async (value) => {
          for await (const x of value) {
            if (listContractId.indexOf(x.contract.id) === -1) {
              listContractId.push(x.contract.id);
            }
          }
        });
    }
    const mapper = new ContractMapper();
    const res = await this.contractRepository.pagedByCustomerId(
      take,
      skip,
      customerId,
      contractCode,
      listContractId,
      startDate,
      endDate,
      status,
    );
    const [data, total] = res;
    const dto = await mapper.listEntityToListDtoPaged(data);

    return paginateResponse(dto, total, skip, take);
  }
  async validationUpdate(dto: UpdateContractDto) {
    if (!dto) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: ContractMessageEnum.DATA_NOT_EXIST,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.contractRepository
      .findOneContractById(dto.contractId)
      .then((val) => {
        if (!val) {
          throw new HttpException(
            {
              status: HttpStatus.NOT_FOUND,
              error: ContractMessageEnum.CONTRACT_NOT_EXISTED,
            },
            HttpStatus.NOT_FOUND,
          );
        }
      });

    if (dto.serviceId.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: ContractMessageEnum.SERVICE_MUST_HAVE,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.serviceRepository
      .countServiceById(dto.serviceId)
      .then((value) => {
        if (value != dto.serviceId.length) {
          throw new HttpException(
            {
              status: HttpStatus.NOT_FOUND,
              error: ContractMessageEnum.SERVICE_NOT_EXISTED,
            },
            HttpStatus.NOT_FOUND,
          );
        }
      });
  }
  async updateContract(dto: UpdateContractDto) {
    await this.validationUpdate(dto);

    let listService = dto.serviceId;
    const listContractRemove = [];
    let contract = null;
    try {
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: ContractMessageEnum.SERVICE_NOT_EXISTED,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.entityManager.transaction(
      async (transactionManager: EntityManager) => {
        await this.contractDetailRepository
          .getContractDetailBycontractExceptServiceId(
            dto.serviceId,
            dto.contractId,
          )
          .then(async (values) => {
            if (values) {
              for await (const removedata of values) {
                listContractRemove.push(removedata.id);
              }
              await transactionManager.remove(ContractDetailEntity, values);
            }
          });
        contract = await this.contractRepository.findOneContractById(
          dto.contractId,
        );
        for await (const id of listContractRemove) {
          contract.contractDetail = contract.contractDetail.filter(
            (val, i, arr) => {
              return val.id != id;
            },
          );
        }
        for await (const x of dto.serviceId) {
          await this.contractDetailRepository
            .findOneContractDertailByServiceId(x, dto.contractId)
            .then(async (values) => {
              if (values) {
                listService = listService.filter((val, i, arr) => {
                  return val != x;
                });
              }
            });
        }
        dto.serviceId = listService;

        const mapper = new ContractMapper();
        const entity = await mapper.dtoToEntityUpdate(dto);
        entity.contractDetail.push(...contract.contractDetail);

        await transactionManager.save(entity.contractDetail);
        delete entity.contractDetail;
        await transactionManager.update(
          ContractEntity,
          { id: entity.id },
          entity,
        );
      },
    );
  }
}
