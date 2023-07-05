import { AccountRepository } from 'src/account/account.repository';
import { CustomerRepository } from './../customer/customer.repository';
import { RoleRepository } from './../role/role.repository';
import { TeamRepository } from './../team/team.repository';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeRepository } from './employee.repository';
import { EmployeeMapper } from './mapper/employee-mapper';
/*
https://docs.nestjs.com/providers#services
*/
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { paginateResponse } from 'src/middleware/paginateResponse';
import { EmployeeMessageEnum } from './enums/employee-enums';
import { UpdateTeamRoleDto } from './dto/update-teamRole.dto';
import { SendMail } from 'src/utils/sendMail';
@Injectable()
export class EmployeeService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly teamRepository: TeamRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async updateTeamRole(updateTeamRoleDto: UpdateTeamRoleDto) {
    return await this.employeeRepository.updateTeamRole(updateTeamRoleDto);
  }

  async findEmployeeByNameOrEmail(param: string) {
    return await this.employeeRepository.findEmployeeByNameOrEmail(param);
  }

  async getAllListEmployee() {
    return await this.employeeRepository.getAllListEmployee();
  }
  //function validation Create Employee
  async validationCreate(dto: CreateEmployeeDto) {
    if (!dto) {
      return EmployeeMessageEnum.DATA_NOT_EXIST;
    }
    const checkUsername = await this.accountRepository.CheckAccountByUserName(
      dto.username,
    );
    if (checkUsername) {
      return EmployeeMessageEnum.USERNAME_EXIST;
    }

    const checkEmailEmp = await this.employeeRepository.findOneEmployeeByEmail(
      dto.email,
    );
    if (checkEmailEmp) {
      return EmployeeMessageEnum.EMAIL_EXIST;
    }
    const checkPhoneEmp = await this.employeeRepository.findOneEmployeeByPhone(
      dto.phone,
    );
    if (checkPhoneEmp) {
      return EmployeeMessageEnum.PHONE_EXIST;
    }
    const checkEmailCus = await this.customerRepository.findOneCustomerByEmail(
      dto.email,
    );
    if (checkEmailCus) {
      return EmployeeMessageEnum.EMAIL_EXIST;
    }
    const checkPhoneCus = await this.customerRepository.findOneCustomerByPhone(
      dto.phone,
    );
    if (checkPhoneCus) {
      return EmployeeMessageEnum.PHONE_EXIST;
    }
    const checkTeam = await this.teamRepository.findTeamById(dto.teamId);
    if (!checkTeam) {
      return EmployeeMessageEnum.TEAM_NOT_EXIST;
    }

    return null;
  }
  async createEmployee(dto: CreateEmployeeDto) {
    const validation = await this.validationCreate(dto);
    if (validation) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: validation,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const role = await this.roleRepository.findIdByEmployeeRole();
    if (!role) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: EmployeeMessageEnum.ROLE_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const mapper = new EmployeeMapper();
    const employeeEntity = await mapper.dtoToEntityCreate(dto, role);
    const passworkSendMail = dto.password;
    const res = await this.employeeRepository.createEmployee(employeeEntity);
    console.log(res.account.id);

    const mail = new SendMail();
    const optionMail = {
      to: dto.email,
      subjects: 'Cấp tài khoản',
      html: `<table border="0" align="center" border="1" cellpadding="0" cellspacing="0" width="800">
            <tr>
                <td align="center" style="padding: 40px 0 30px 0;">
                    <h2>CẤP TÀI KHOẢN VÀ MẬT KHẨU</h2>
                </td>
            </tr>
            <tr>
                <td>
                    <p>Xin chào ${dto.fullname}</p>
                    <p>Chào mừng bạn đến với trung tâm hỗ trợ khách hàng của ITNow.</p>
                    <p>Dưới đây là thông tin đăng nhập ứng dụng ITnow. Bạn có thể truy cập bằng 2 cách</p>
                    <p>1)Quét mã QR hoặc hướng dẫn tải app.</p>
                    <p>2) Link đăng nhập web: </p>
                    <p>Username: ${dto.username}</p>
                    <p>Password: ${passworkSendMail}</p>
                    <p>3)Xác nhận email: <a href="http://45.117.79.186:3001/api/v1/accounts/active-account-by-email/${res.account.id}">Xác minh ngay</a></p> 
                    <p>Nếu bạn cần thêm thông tin vui lòng gọi hotline: 0868.771.333 hoặc truy cập <a href="https://itnow.vn/lien-he/">https://itnow.vn/lien-he/</a> để được hỗ trợ nhanh nhất.</p>
                    <p>Trân trọng!</p>
                    <b>Công ty ITnow</b>
                </td>
            </tr>
      
        </table>`,
    };
    mail.sendMail(optionMail);
    delete res.account.password;
    try {
      return res;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: EmployeeMessageEnum.CREATE_ERROR,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async validationUpdate(data: UpdateEmployeeDto) {
    if (!data) {
      return EmployeeMessageEnum.DATA_NOT_EXIST;
    }

    const checkEmailEmp = await this.employeeRepository
      .findOneEmployeeByEmailExceptId(data.email, data.id)
      .then((value) => {
        if (value) {
          return EmployeeMessageEnum.EMAIL_EXIST;
        }
      });
    if (checkEmailEmp) {
      return checkEmailEmp;
    }
    const checkPhoneEmp = await this.employeeRepository
      .findOneEmployeeByPhoneExceptId(data.phone, data.id)
      .then((value) => {
        if (value) {
          return EmployeeMessageEnum.PHONE_EXIST;
        }
      });

    if (checkPhoneEmp) {
      return checkPhoneEmp;
    }
    const checkEmailCus = await this.customerRepository
      .findOneCustomerByEmail(data.email)
      .then((value) => {
        if (value) {
          return EmployeeMessageEnum.EMAIL_EXIST;
        }
      });
    if (checkEmailCus) {
      return checkEmailCus;
    }
    const checkPhoneCus = await this.customerRepository
      .findOneCustomerByPhone(data.phone)
      .then((value) => {
        if (value) {
          return EmployeeMessageEnum.PHONE_EXIST;
        }
      });

    if (checkPhoneCus) {
      return checkPhoneCus;
    }

    const checkTeam = await this.teamRepository.findTeamById(data.teamId);
    if (!checkTeam) {
      return EmployeeMessageEnum.TEAM_NOT_EXIST;
    }
    return null;
  }
  async updateEmployee(dto: UpdateEmployeeDto) {
    const employee = await this.employeeRepository.findOneWithStatusTrue(
      dto.id,
    );

    if (!employee) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: EmployeeMessageEnum.EMPLOYEE_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const validation = await this.validationUpdate(dto);
    if (validation) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: validation,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const mapper = new EmployeeMapper();
      const entity = await mapper.dtoToEntityUpdate(dto, employee.account);
      return await this.employeeRepository.updateEmployee(employee, entity);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: EmployeeMessageEnum.UPDATE_ERROR,
          data: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async changeStatusEmployee(id: number, status: string) {
    const employees = await this.employeeRepository.findOne({
      relations: { account: true },
      where: { id: id },
    });
    if (!employees) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: EmployeeMessageEnum.EMPLOYEE_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    let isStatus = true;
    if (status === 'true' || status === 'false') {
      isStatus = status === 'true' ? true : false;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: EmployeeMessageEnum.STATUS_FORMAT,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const mapper = new EmployeeMapper();
      const employee = await mapper.dtoToEntityUpdateStatus(
        id,
        isStatus,
        employees,
      );

      const status = await this.employeeRepository.updateStatusEmployee(
        employee,
      );
      return status;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: EmployeeMessageEnum.SET_STATUS_ERROR,
          data: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async pagedEmployee(
    take: number,
    skip: number,
    name: string,
    email: string,
    teamRole: string,
    teamName: string,
    branchName: string,
    status: string,
    sex: string,
  ) {
    try {
      if (isNaN(take)) {
        take = 10;
      }
      if (isNaN(skip)) {
        skip = 0;
      }
      const mapper = new EmployeeMapper();

      const res = await this.employeeRepository.paged(
        take,
        skip,
        name,
        email,
        teamRole,
        teamName,
        branchName,
        status,
        sex,
      );
      const [data, total] = res;
      const employeeLeader =
        await this.employeeRepository.findAllWithStatusTrue();
      const list = await mapper.listEntityToListDtoPaged(data, employeeLeader);
      return paginateResponse(list, total, skip, take);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: EmployeeMessageEnum.PAGED_ERROR,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async pagedEmployeeByTeamId(
    take: number,
    skip: number,
    name: string,
    email: string,
    teamRole: string,
    teamId: number,
    status: string,
    sex: string,
  ) {
    try {
      if (isNaN(take)) {
        take = 10;
      }
      if (isNaN(skip)) {
        skip = 0;
      }
      const mapper = new EmployeeMapper();

      const res = await this.employeeRepository.pagedByTeam(
        take,
        skip,
        name,
        email,
        teamRole,
        teamId,
        status,
        sex,
      );
      const [data, total] = res;
      const employeeLeader =
        await this.employeeRepository.findAllWithStatusTrue();
      const list = await mapper.listEntityToListDtoPaged(data, employeeLeader);
      return paginateResponse(list, total, skip, take);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: EmployeeMessageEnum.PAGED_ERROR,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkExistTeam(teamId: number) {
    const check = await this.teamRepository.findTeamById(teamId);
    if (!check) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: EmployeeMessageEnum.TEAM_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getEmpByTeam(teamId: number) {
    await this.checkExistTeam(teamId);
    const result = await this.employeeRepository.findEmployeeByTeamId(teamId);
    return result;
  }
}
