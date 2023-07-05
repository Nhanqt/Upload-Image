import { AccountRepository } from 'src/account/account.repository';
import { CustomerAccountRepository } from './../customerAccount/customer-account.repository';
import { EmployeeRepository } from './../employee/employee.repository';
import { RoleRepository } from './../role/role.repository';
import { TeamRepository } from './../team/team.repository';
import { CustomerRepository } from './customer.repository';
import { CustomerMessageEnum } from './enums/customer-enums';
/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isBoolean } from 'class-validator';
import { paginateResponse } from 'src/middleware/paginateResponse';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { CustomerMapper } from './mapper/customer-mapper';
import { SendMail } from 'src/utils/sendMail';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerAccountRepository: CustomerAccountRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly accountRepository: AccountRepository,
    private readonly teamRepository: TeamRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  //function validation Create Employee
  async validationCreate(dto: CreateCustomerDto) {
    if (!dto) {
      return CustomerMessageEnum.DATA_NOT_EXIST;
    }
    const checkUsername = await this.accountRepository.CheckAccountByUserName(
      dto.username,
    );
    if (checkUsername) {
      return CustomerMessageEnum.USERNAME_EXIST;
    }
    const checkEmailCus = await this.customerRepository.findOneCustomerByEmail(
      dto.email,
    );
    if (checkEmailCus) {
      return CustomerMessageEnum.EMAIL_EXIST;
    }
    const checkPhoneCus = await this.customerRepository.findOneCustomerByPhone(
      dto.phone,
    );
    if (checkPhoneCus) {
      return CustomerMessageEnum.PHONE_EXIST;
    }
    const checkEmailEmp = await this.employeeRepository.findOneEmployeeByEmail(
      dto.email,
    );
    if (checkEmailEmp) {
      return CustomerMessageEnum.EMAIL_EXIST;
    }
    const checkPhoneEmp = await this.employeeRepository.findOneEmployeeByPhone(
      dto.phone,
    );
    if (checkPhoneEmp) {
      return CustomerMessageEnum.PHONE_EXIST;
    }
    const checkTeam = await this.teamRepository.findTeamById(dto.teamId);
    if (!checkTeam) {
      return CustomerMessageEnum.TEAM_NOT_EXIST;
    }

    return null;
  }
  async createCustomer(dto: CreateCustomerDto) {
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
    const role = await this.roleRepository.findIdByCustomerRole();
    if (!role) {
      return CustomerMessageEnum.ROLE_NOT_EXIST;
    }
    try {
      const mapper = new CustomerMapper();
      //save password before mapping
      const passworkSendMail = dto.password;
      const entity = await mapper.dtoToEntityCreate(dto, role);
      const res = await this.customerAccountRepository.createCustomer(entity);

      //send mail
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
                    <p>Xin chào ${dto.name}</p>
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
      return res;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: CustomerMessageEnum.CREATE_ERROR,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async validationUpdate(data: UpdateCustomerDto) {
    if (!data) {
      return CustomerMessageEnum.DATA_NOT_EXIST;
    }
    const checkMailCus =
      await this.customerAccountRepository.findOneCustomerByEmailExceptId(
        data.email,
        data.id,
      );

    if (checkMailCus) {
      return checkMailCus;
    }
    const checkMailEmp = await this.employeeRepository
      .findOneEmployeeByEmail(data.email)
      .then((value) => {
        if (value) {
          return CustomerMessageEnum.EMAIL_EXIST;
        }
      });
    if (checkMailEmp) {
      return checkMailEmp;
    }
    const checkPhoneCus = await this.customerAccountRepository
      .findOneCustomerByPhoneExceptId(data.phone, data.id)
      .then((value) => {
        if (value) {
          return CustomerMessageEnum.EMAIL_EXIST;
        }
      });

    if (checkPhoneCus) {
      return checkPhoneCus;
    }
    const checkPhoneEmp = await this.employeeRepository
      .findOneEmployeeByPhone(data.phone)
      .then((value) => {
        if (value) {
          return CustomerMessageEnum.PHONE_EXIST;
        }
      });

    if (checkPhoneEmp) {
      return checkPhoneEmp;
    }

    const checkTeam = await this.teamRepository.findTeamById(data.teamId);
    if (!checkTeam) {
      return CustomerMessageEnum.TEAM_NOT_EXIST;
    }
    return null;
  }
  async updateCustomer(dto: UpdateCustomerDto) {
    const customer = await this.customerAccountRepository.getCustomerByIdUpdate(
      dto.id,
    );

    if (!customer) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: CustomerMessageEnum.CUSTOMER_NOT_EXIST,
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
      const mapper = new CustomerMapper();
      const entity = await mapper.dtoToEntityUpdate(dto, customer);
      return await this.customerAccountRepository.UpdateCustomer(
        customer,
        entity,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: CustomerMessageEnum.UPDATE_ERROR,
          data: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async setStatusCustomer(id: number, status: string) {
    const customer = await this.customerAccountRepository.getCustomerByIdUpdate(
      id,
    );
    if (!customer) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: CustomerMessageEnum.CUSTOMER_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    let isStatus = true;
    if (status === 'true' || status === 'false' || isBoolean(status)) {
      isStatus = status === 'true' ? true : false;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: CustomerMessageEnum.STATUS_FORMAT,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const mapper = new CustomerMapper();
      const accountCustomer = await mapper.dtoToEntityUpdateStatus(
        id,
        isStatus,
        customer,
      );
      return await this.customerAccountRepository.UpdateStatusCustomer(
        accountCustomer,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: CustomerMessageEnum.SET_STATUS_ERROR,
          data: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async pagedCustomer(
    take: number,
    skip: number,
    nameSearch: string,
    emailSearch: string,
    teamName: string,
    branchNameSearch: string,
    status: string,
  ) {
    if (isNaN(take)) {
      take = 10;
    }
    if (isNaN(skip)) {
      skip = 1;
    }
    const mapper = new CustomerMapper();
    const res = await this.customerAccountRepository.paged(
      take,
      skip,
      nameSearch,
      emailSearch,
      teamName,
      branchNameSearch,
      status,
    );
    const [data, total] = res;
    const dto = await mapper.ListEntityToDtoPaged(data);
    return paginateResponse(dto, total, skip, take);
  }
  async getCustomerById(id: number) {
    try {
      const customer = await this.customerRepository.findOneCustomerById(id);
      const mapper = new CustomerMapper();
      const res = mapper.EntityToDto(customer);
      return res;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: CustomerMessageEnum.GET_ERROR,
          data: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getCustomerAll() {
    try {
      const customer =
        await this.customerRepository.findAllCustomerWithStatusTrue();
      const mapper = new CustomerMapper();
      const list = mapper.ListEntityToDto(customer);
      return list;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: CustomerMessageEnum.GET_ERROR,
          data: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
