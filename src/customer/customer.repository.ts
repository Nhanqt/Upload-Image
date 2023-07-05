import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { Repository } from 'typeorm';
import { CustomerEntity } from './entity/customer.entity';

@CustomRepository(CustomerEntity)
export class CustomerRepository extends Repository<CustomerEntity> {
  public async findAllCustomerWithStatusTrue() {
    const res = await this.find({
      relations: {
        contract: { contractDetail: { service: true } },
        team: { branch: true },
      },
      where: { customerAccount: { account: { status: true } } },
    });

    return res;
  }
  public async findOneCustomerById(id: number) {
    const res = await this.findOne({
      relations: {
        customerAccount: { account: true },
        contract: { contractDetail: { service: true } },
        team: { branch: true },
      },
      where: { id: id },
    });
    return res;
  }
  public async findOneCustomerByEmail(email: string) {
    return await this.findOne({
      where: { email: email },
    });
  }
  public async findOneCustomerByPhone(phone: string) {
    return await this.findOne({
      where: { phone: phone },
    });
  }
}
