import * as bcrypt from 'bcrypt';
import { Helper } from 'src/helper/helper';
import { CustomerAccountEntity } from '../../customerAccount/entity/customerAccount.entity';
import { CreateCustomerDto, PagedCustomerDto, UpdateCustomerDto } from '../dto';
import { AccountEntity } from './../../account/entity/account.entity';
import { RoleEntity } from './../../role/entity/role.entity';
import { TeamEntity } from './../../team/entity/team.entity';
import { GetAllCustomer } from './../dto/get-all-customer.dto';
import { CustomerEntity } from './../entity/customer.entity';
export class CustomerMapper {
  async dtoToEntityCreate(dto: CreateCustomerDto, role: RoleEntity) {
    const teamEntity = new TeamEntity();
    teamEntity.id = dto.teamId;
    const accountEntity = new AccountEntity();
    accountEntity.username = dto.username;
    const hashedPassword = await bcrypt.hash(dto.password, 13);
    accountEntity.password = hashedPassword;
    accountEntity.isFirstLogin = true;
    accountEntity.status = true;
    accountEntity.role = role;
    accountEntity.isEmailActive = false;
    const customerEntity = new CustomerEntity();
    customerEntity.name = dto.name;
    customerEntity.phone = dto.phone;
    customerEntity.email = dto.email;
    customerEntity.address = dto.address;
    customerEntity.businessAreas = dto.businessAreas;
    customerEntity.isSignedContract = false;
    customerEntity.team = teamEntity;
    const customerAccount = new CustomerAccountEntity();
    customerAccount.customer = customerEntity;
    customerAccount.account = accountEntity;
    return customerAccount;
  }
  async dtoToEntityUpdate(
    dto: UpdateCustomerDto,
    customers: CustomerAccountEntity,
  ) {
    const teamEntity = new TeamEntity();
    teamEntity.id = dto.teamId;
    const accountEntity = new AccountEntity();
    const isStatus = dto.status === 'true' || dto.status ? true : false;
    accountEntity.status = isStatus;
    accountEntity.id = customers.account.id;
    const customerEntity = new CustomerEntity();
    customerEntity.id = customers.customer.id;
    customerEntity.name = dto.name;
    customerEntity.phone = dto.phone;
    customerEntity.email = dto.email;
    customerEntity.address = dto.address;
    customerEntity.businessAreas = dto.businessAreas;
    customerEntity.team = teamEntity;
    const customerAccount = new CustomerAccountEntity();
    customerAccount.customer = customerEntity;
    customerAccount.account = accountEntity;
    return customerAccount;
  }
  async dtoToEntityUpdateStatus(
    id: number,
    status: boolean,
    customers: CustomerAccountEntity,
  ) {
    const accountEntity = new AccountEntity();
    accountEntity.id = customers.account.id;
    accountEntity.status = status;
    const customerEntity = new CustomerEntity();
    customerEntity.id = customers.customer.id;
    const customerAccount = new CustomerAccountEntity();
    customerAccount.id = id;
    customerAccount.customer = customerEntity;
    customerAccount.account = accountEntity;
    return customerAccount;
  }
  async ListEntityToDtoPaged(customers: CustomerAccountEntity[]) {
    const list = [];
    customers.forEach((x) => {
      const customer = new PagedCustomerDto();
      customer.id = x.id;
      customer.name = x.customer.name;
      customer.email = x.customer.email;
      customer.address = x.customer.address;
      customer.phone = x.customer.phone;
      customer.businessAreas = x.customer.businessAreas;
      customer.teamId = x.customer.team.id;
      customer.teamName = x.customer.team.teamName;
      customer.branchName = x.customer.team.branch.branchName;
      customer.status = x.account.status;
      customer.accountid = x.account.id;
      customer.isEmailActive = x.account.isEmailActive;
      customer.username = x.account.username;
      customer.createAt = Helper.convertToLocaleDateShow(x.customer.createAt);
      list.push(customer);
    });
    return list;
  }
  async EntityToDto(x: CustomerEntity) {
    const customer = new GetAllCustomer();
    customer.id = x.id;
    customer.name = x.name;
    customer.email = x.email;
    customer.address = x.address;
    customer.phone = x.phone;
    customer.businessAreas = x.businessAreas;
    customer.teamId = x.team.id;
    customer.teamName = x.team.teamName;
    customer.branchName = x.team.branch.branchName;
    customer.createAt = Helper.convertToLocaleDateShow(x.createAt);
    customer.contract = x.contract;
    customer.status = x.customerAccount[0].account.status;
    customer.accountId = x.customerAccount[0].account.id;
    return customer;
  }
  async ListEntityToDto(customers: CustomerEntity[]) {
    const list = [];
    customers.forEach((x) => {
      const customer = new GetAllCustomer();
      customer.id = x.id;
      customer.name = x.name;
      customer.email = x.email;
      customer.address = x.address;
      customer.phone = x.phone;
      customer.businessAreas = x.businessAreas;
      customer.teamId = x.team.id;
      customer.teamName = x.team.teamName;
      customer.branchName = x.team.branch.branchName;
      customer.createAt = Helper.convertToLocaleDateShow(x.createAt);
      customer.contract = x.contract;
      list.push(customer);
    });
    return list;
  }
}
