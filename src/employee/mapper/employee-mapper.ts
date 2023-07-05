import { Helper } from './../../helper/helper';
import { TeamEntity } from './../../team/entity/team.entity';
import { RoleEntity } from './../../role/entity/role.entity';
import { AccountEntity } from './../../account/entity/account.entity';
import { EmployeeEntity } from './../entity/employee.entity';
import * as bcrypt from 'bcrypt';
import {
  CreateEmployeeDto,
  PagedEmployeeDto,
  TeamLeader,
  UpdateEmployeeDto,
} from '../dto';
export class EmployeeMapper {
  async listEntityToListDtoPaged(
    employees: EmployeeEntity[],
    employeeLeader: EmployeeEntity[],
  ) {
    const list = [];
    employees.forEach((x) => {
      const employee = new PagedEmployeeDto();
      employeeLeader.forEach((y) => {
        if (x.team.id === y.team.id) {
          if ('LEADER' === y.teamRole) {
            const emp = new TeamLeader();
            emp.id = y.id;
            emp.fullname = y.fullname;
            emp.email = y.email;
            emp.phone = y.phone;
            emp.address = y.address;
            emp.sex = y.sex;
            emp.teamRole = y.teamRole;
            emp.status = y.account.status;
            employee.leader = emp;
          }
        }
      });
      employee.id = x.id;
      employee.fullname = x.fullname;
      employee.email = x.email;
      employee.phone = x.phone;
      employee.address = x.address;
      employee.sex = x.sex;
      employee.teamRole = x.teamRole;
      employee.dateOfBirth = Helper.convertToLocaleDateShow(
        new Date(x.dateOfBirth),
      );
      employee.createAt = Helper.convertToLocaleDateShow(new Date(x.createAt));
      employee.teamName = x.team.teamName;
      employee.teamId = x.team.id;
      employee.branchName = x.team.branch.branchName;
      employee.status = x.account.status;
      employee.username = x.account.username;
      employee.accountid = x.account.id;
      employee.isEmailActive = x.account.isEmailActive;
      list.push(employee);
    });
    return list;
  }
  async dtoToEntityCreate(employeeDto: CreateEmployeeDto, role: RoleEntity) {
    const teamEntity = new TeamEntity();
    teamEntity.id = employeeDto.teamId;
    const accountEntity = new AccountEntity();
    accountEntity.username = employeeDto.username;
    const hashedPassword = await bcrypt.hash(employeeDto.password, 13);
    accountEntity.password = hashedPassword;
    accountEntity.isFirstLogin = true;
    accountEntity.status = true;
    accountEntity.role = role;
    accountEntity.isEmailActive = false;
    const employeeEntity = new EmployeeEntity();
    employeeEntity.fullname = employeeDto.fullname;
    employeeEntity.phone = employeeDto.phone;
    employeeEntity.email = employeeDto.email;
    employeeEntity.address = employeeDto.address;
    employeeEntity.teamRole = employeeDto.teamRole;
    employeeEntity.dateOfBirth = Helper.convertToLocaleDate(
      new Date(employeeDto.dateOfBirth),
    );
    employeeEntity.sex = employeeDto.sex;
    employeeEntity.account = accountEntity;
    employeeEntity.team = teamEntity;
    return employeeEntity;
  }

  async dtoToEntityUpdate(data: UpdateEmployeeDto, account: AccountEntity) {
    const accountEntity = new AccountEntity();
    accountEntity.id = account.id;
    const isStatus = data.status === 'true' || data.status ? true : false;
    accountEntity.status = isStatus;
    const teamEntity = new TeamEntity();
    teamEntity.id = data.teamId;
    const employeeEntity = new EmployeeEntity();
    employeeEntity.id = data.id;
    employeeEntity.team = teamEntity;
    employeeEntity.account = accountEntity;
    employeeEntity.teamRole = data.teamRole;
    employeeEntity.fullname = data.fullname;
    employeeEntity.email = data.email;
    employeeEntity.phone = data.phone;
    employeeEntity.address = data.address;
    employeeEntity.sex = data.sex;
    employeeEntity.dateOfBirth = Helper.convertToLocaleDate(
      new Date(data.dateOfBirth),
    );
    return employeeEntity;
  }
  async dtoToEntityUpdateStatus(
    id: number,
    status: boolean,
    employee: EmployeeEntity,
  ) {
    const accountEntity = new AccountEntity();
    accountEntity.id = employee.account.id;
    accountEntity.status = status;
    const employeeEntity = new EmployeeEntity();
    employeeEntity.id = id;
    employeeEntity.account = accountEntity;
    return employeeEntity;
  }
}
