import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { In, Not, Repository } from 'typeorm';
import { ContractDetailEntity } from './entity/contractDetail.entity';

@CustomRepository(ContractDetailEntity)
export class ContractDetailRepository extends Repository<ContractDetailEntity> {
  public async findContractDetailById(id: number) {
    return await this.find({
      relations: { service: true },
      where: {
        contract: {
          id: id,
        },
      },
    });
  }
  public async getAllContractIdContainService(service: number[]) {
    return await this.find({
      relations: { service: true, contract: true },
      select: { contract: { id: true } },
      where: {
        service: { id: In(service) },
      },
    });
  }
  public async getAllContractIdContainServiceAndCustomerId(
    service: number[],
    customerId: number,
  ) {
    return await this.find({
      relations: { service: true, contract: true },
      select: { contract: { id: true } },
      where: {
        service: { id: In(service) },
        contract: { customer: { id: customerId } },
      },
    });
  }
  public async getContractDetailBycontractExceptServiceId(
    service: number[],
    contractId: number,
  ) {
    return await this.find({
      where: {
        service: { id: Not(In(service)) },
        contract: { id: contractId },
      },
    });
  }
  // public async removeContractDetail(contractDetail: ContractDetailEntity[]) {
  //   return await this.remove(contractDetail);
  // }
  public async findOneContractDertailByServiceId(
    serviceId: number,
    contractId: number,
  ) {
    return await this.findOne({
      where: { service: { id: serviceId }, contract: { id: contractId } },
    });
  }
}
