import { CreateContractRequest } from 'src/contract/dto/contract.dto';
import { ContractEntity } from 'src/contract/entity/contract.entity';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { ContractDetailEntity } from '../entity/contractDetail.entity';

export class ContractDetailMapper {
  async toListEntity(contractId: number, serviceId: any[]) {
    const list = [];
    const contract = new ContractEntity();
    contract.id = contractId;
    serviceId.map((value) => {
      const service = new ServiceEntity();
      service.id = value;
      const contractDetailEntity = new ContractDetailEntity();
      contractDetailEntity.contract = contract;
      contractDetailEntity.service = service;
      list.push(contractDetailEntity);
    });
    return list;
  }
}
