import { CreateContractRequest } from 'src/contract/dto/contract.dto';
import { ContractDetailEntity } from 'src/contractDetail/entity/contractDetail.entity';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { PagedServiceDto } from 'src/service/dto';
import {
  PagedContractDetail,
  PagedContractDto,
  UpdateContractDto,
} from '../dto';
import { ContractEntity } from '../entity/contract.entity';
import { Helper } from './../../helper/helper';
import { ServiceEntity } from './../../service/entity/service.entity';

export class ContractMapper {
  async listDtoToListEntityCreate(
    data: CreateContractRequest[],
  ): Promise<ContractEntity[]> {
    const listEntity: ContractEntity[] = [];
    for await (const dto of data) {
      const listCDEntity: ContractDetailEntity[] = [];
      const customerEntity = new CustomerEntity();
      customerEntity.id = dto.customerId;
      customerEntity.isSignedContract = true;
      const contractEntity = new ContractEntity();
      contractEntity.contractCode = dto.contractCode;
      contractEntity.startDate = Helper.convertToLocaleDate(
        new Date(dto.startDate),
      );
      contractEntity.endDate = Helper.convertToLocaleDate(
        new Date(dto.endDate),
      );
      contractEntity.folderContractUrl = dto.folderContractUrl;
      contractEntity.createAt = new Date();
      contractEntity.status = true;
      contractEntity.customer = customerEntity;

      for await (const x of dto.serviceId) {
        const serviceEntity = new ServiceEntity();
        serviceEntity.id = x;
        const contractDetailEntity = new ContractDetailEntity();
        contractDetailEntity.contract = contractEntity;
        contractDetailEntity.service = serviceEntity;
        listCDEntity.push(contractDetailEntity);
      }
      contractEntity.contractDetail = listCDEntity;
      listEntity.push(contractEntity);
    }
    return listEntity;
  }
  async dtoToEntityUpdate(dto: UpdateContractDto) {
    const listCDEntity: ContractDetailEntity[] = [];
    const entity = new ContractEntity();
    entity.id = dto.contractId;
    entity.contractCode = dto.contractCode;
    entity.folderContractUrl = dto.url;
    entity.startDate = Helper.convertToLocaleDate(new Date(dto.startDate));
    entity.endDate = Helper.convertToLocaleDate(new Date(dto.endDate));
    for await (const x of dto.serviceId) {
      const serviceEntity = new ServiceEntity();
      serviceEntity.id = x;
      const contractDetailEntity = new ContractDetailEntity();
      contractDetailEntity.contract = entity;
      contractDetailEntity.service = serviceEntity;
      listCDEntity.push(contractDetailEntity);
    }
    entity.contractDetail = listCDEntity;
    return entity;
  }
  async listEntityToListDtoPaged(entity: ContractEntity[]) {
    const listDto = [];
    for await (const x of entity) {
      const listDetail = [];
      const listServiceName = [];
      for await (const y of x.contractDetail) {
        const service = new PagedServiceDto();
        service.id = y.service.id;
        service.serviceName = y.service.serviceName;
        listServiceName.push(y.service.serviceName);
        service.description = y.service.description;
        service.status = y.service.status;
        const pagedContractDetail = new PagedContractDetail();
        pagedContractDetail.contractDetailId = y.id;
        pagedContractDetail.service = service;
        listDetail.push(pagedContractDetail);
      }
      const dto = new PagedContractDto();
      dto.customerId = x.customer.id;
      dto.phone = x.customer.phone;
      dto.address = x.customer.address;
      dto.name = x.customer.name;
      dto.email = x.customer.email;
      dto.businessAreas = x.customer.businessAreas;
      dto.accountStatus = x.customer.customerAccount[0].account.status;
      dto.teamName = x.customer.team.teamName;
      dto.teamId = x.customer.team.id;
      dto.branchName = x.customer.team.branch.branchName;
      dto.contractId = x.id;
      dto.key = x.id;
      dto.listService = listServiceName;
      dto.contractCode = x.contractCode;
      dto.status = x.status;
      dto.folderContractUrl = x.folderContractUrl;
      dto.contractDetail = listDetail;
      dto.createAt = Helper.convertToLocaleDateShow(new Date(x.createAt));
      dto.startDate = Helper.convertToLocaleDateShow(new Date(x.startDate));
      dto.endDate = Helper.convertToLocaleDateShow(new Date(x.endDate));
      listDto.push(dto);
    }
    return listDto;
  }
}
