import { RoleEntity } from 'src/role/entity/role.entity';
import { AccountEntity } from './../entity/account.entity';
import { AccountDto } from './../dto/account.dto';
import { AdminAndCallCenterLogin, CustomerLogin, EmployeeLogin } from '../dto';
import { Helper } from 'src/helper/helper';
export class AccountMapper {
  dtoToEntityAccount(accountdto: AccountDto, hashedPassword: string) {
    const accountEntity = new AccountEntity();
    const roleEntity = new RoleEntity();
    accountEntity.username = accountdto.username;
    accountEntity.password = hashedPassword;
    roleEntity.id = accountdto.roleid;
    accountEntity.role = roleEntity;
    accountEntity.isFirstLogin = true;
    accountEntity.status = true;
    return accountEntity;
  }

  entityToDtoAccount(accountEntity: AccountEntity) {
    const accountDto = new AccountDto();
    accountDto.accountid = accountEntity.id;
    accountDto.username = accountEntity.username;
    accountDto.isFirstLogin = accountEntity.isFirstLogin;
    accountDto.roleid = accountEntity.role.id;
    accountDto.status = accountEntity.status;
    return accountDto;
  }
  async entityToDtoLogin(values: any) {
    const data = values.data;
    if (!data) {
      return null;
    } 

    switch (values.role) {
      case 'ADMIN':
        const res1 = new AdminAndCallCenterLogin();
        res1.accountId = data.id;
        res1.isFirstLogin = data.isFirstLogin;
        res1.roleName = data.role.roleName;
        res1.status = data.status;
        res1.username = data.username;
        res1.isEmailActive = data.isEmailActive;
        return res1;
      case 'CALL_CENTER': 

        const res0 = new AdminAndCallCenterLogin();
        res0.accountId = data.id;
        res0.isFirstLogin = data.isFirstLogin;
        res0.roleName = data.role.roleName;
        res0.status = data.status;
        res0.username = data.username; 
        res0.isEmailActive = data.isEmailActive;
        return res0;
      case 'EMPLOYEE':
        const res2 = new EmployeeLogin();
        res2.accountId = data.account.id;
        res2.username = data.account.username;
        res2.isFirstLogin = data.account.isFirstLogin;
        res2.roleName = data.account.role.roleName;
        res2.status = data.account.status;
        res2.employeeId = data.id;
        res2.fullname = data.fullname;
        res2.email = data.email;
        res2.address = data.address;
        res2.phone = data.phone;
        res2.sex = data.sex;
        res2.teamRole = data.teamRole;
        res2.createAt = Helper.convertToLocaleDateShow(data.createAt);
        res2.dateOfBirth = Helper.convertToLocaleDateShow(data.dateOfBirth);
        res2.teamId = data.team.id;
        res2.teamName = data.team.teamName;
        res2.branchId = data.team.branch.id;
        res2.branchName = data.team.branch.branchName;
        res2.isEmailActive = data.account.isEmailActive;
        return res2;
      case 'CUSTOMER':
        const res3 = new CustomerLogin();
        res3.accountId = data.account.id;
        res3.username = data.account.username;
        res3.isFirstLogin = data.account.isFirstLogin;
        res3.roleName = data.account.role.roleName;
        res3.status = data.account.status;
        res3.customerId = data.customer.id;
        res3.name = data.customer.name;
        res3.email = data.customer.email;
        res3.address = data.customer.address;
        res3.phone = data.customer.phone;
        res3.isSignedContract = data.customer.isSignedContract;
        res3.businessAreas = data.customer.businessAreas;
        res3.createAt = Helper.convertToLocaleDateShow(data.customer.createAt);
        res3.teamId = data.customer.team.id;
        res3.teamName = data.customer.team.teamName;
        res3.branchId = data.customer.team.branch.id;
        res3.branchName = data.customer.team.branch.branchName;
        res3.isEmailActive = data.account.isEmailActive;
        return res3;
      default:
        return null;
    }
  }
}
