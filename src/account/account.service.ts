import { CustomerEntity } from './../customer/entity/customer.entity';
import { CustomerAccountEntity } from '../customerAccount/entity/customerAccount.entity';
import { EmployeeEntity } from './../employee/entity/employee.entity';
import { AccountMapper } from './mapper/account.mapper';
import { AccountDto } from './dto/account.dto';
/*
https://docs.nestjs.com/providers#services
*/
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from './entity/account.entity';
import { Repository } from 'typeorm';
import { SendMail } from 'src/utils/sendMail';
import e, { Response } from 'express';
import {
  ChangePasswordDTO,
  ForgetPassWordDto,
  LoginDto,
  LogoutDto,
} from './dto';
import { AccountMessageEnum } from './enums/account-error-enums';
import { FirstLoginDto } from './dto/first-login.dto';
import { ResendEmailDto } from './dto/resend-email';
import { UserRole } from './enums/account-role-enums';
@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
    @InjectRepository(CustomerAccountEntity)
    private readonly customerAccountRepository: Repository<CustomerAccountEntity>,
  ) {}

  async changePasswordIsFirstLogin(accountId: number, dto: FirstLoginDto) {
    if (dto.isChange) {
      const hashedPassword = await bcrypt.hash(dto.newPassword, 13);
      await this.accountRepository.query(`update account 
      set "isFirstLogin" = false, "password" = '${hashedPassword}'
      where id = ${accountId}`);
      return { message: `Cập nhật thành công` };
    } else {
      await this.accountRepository.query(`update account 
      set "isFirstLogin" = false
      where id = ${accountId}`);
      return { message: `Cập nhật thành công` };
    }
  }

  async getAccountEmail(email: string) {
    const employeeEmail = await this.employeeRepository.findOne({
      relations: { account: true },
      where: { email: email },
    });
    const customerEmail = await this.customerAccountRepository.findOne({
      relations: { account: true, customer: true },
      where: { customer: { email: email } },
    });
    if (!customerEmail && !employeeEmail) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Email không tồn tại.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return employeeEmail
      ? {
          email: employeeEmail.email,
          accountId: employeeEmail.account.id,
          employeeId: employeeEmail.id,
          isEmployee: true,
        }
      : {
          email: customerEmail.customer.email,
          accountId: customerEmail.account.id,
          customerId: customerEmail.customer.id,
          isEmployee: false,
        };
  }
  async generateString(length) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  async forgetPassword(dto: ForgetPassWordDto) {
    const data = await this.getAccountEmail(dto.email);
    if (data.email) {
      const newPasswordRandom = (await this.generateString(6)).toString();
      const hashedPassword = await bcrypt.hash(newPasswordRandom.trim(), 13);
      dto.password = hashedPassword;
      const password = dto.password;
      if (data.isEmployee) {
        const employee = new EmployeeEntity();
        employee.id = data.employeeId;
        const account = new AccountEntity();
        account.id = data.accountId;
        account.password = password;
        employee.account = account;
        await this.employeeRepository.save(employee);
      } else {
        const customerAccount = new CustomerAccountEntity();
        const customer = new CustomerEntity();
        customer.id = data.customerId;
        const account = new AccountEntity();

        account.password = password;
        account.id = data.accountId;
        customerAccount.account = account;
        customerAccount.customer = customer;
        await this.accountRepository.save(account);
      }
      console.log('sending...');
      const mail = new SendMail();
      const optionMail = {
        to: `${dto.email}`,
        subjects: 'Cập Nhật Mật Khẩu',
        html: `<table border="0" align="center" border="1" cellpadding="0" cellspacing="0" width="800">
        <tr>
            <td align="center" style="padding: 40px 0 30px 0;">
                <h2>QUÊN MẬP KHẨU</h2>
            </td>
        </tr>
        <tr>
            <td>
                <p>Xin chào,</p>
                <p>Chào mừng bạn đến với trung tâm hỗ trợ khách hàng của ITNow.</p>
                <p>Dưới đây là mật khẩu mới của quý khách.</p>
                <p>Password: ${newPasswordRandom}</p>
                <p>Nếu bạn cần thêm thông tin vui lòng gọi hotline: 0868.771.333 hoặc truy cập <a href="https://itnow.vn/lien-he/">https://itnow.vn/lien-he/</a> để được hỗ trợ nhanh nhất.</p>
                <p>Trân trọng!</p>
                <b>Công ty ITnow</b>
            </td>
        </tr>`,
      };
      mail.sendMail(optionMail);
      return { message: `Đã gửi mật khẩu của bạn qua email.` };
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Email không đúng!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteToken(logoutdto: LogoutDto, accountid: number) {
    const deleteToken = await this.accountRepository.query(`
    DELETE FROM "tokenDevice" td
    WHERE td."accountId" = ${accountid} and td."token" = '${logoutdto.token}'
    `);
    return deleteToken;
  }

  async findOneByAccountId(accountid: string) {
    const data = await this.accountRepository.query(`
    select a.id as accountid, a.username ,a."isFirstLogin", a.status, a.password, r."roleName"
    from account a
    join role r on r.id = a."roleId"
    where a.id = '${accountid}'`);
    return data;
  }

  async findAccount(accountid: number, roleName: string) {
    let result = '';
    if (roleName === 'EMPLOYEE') {
      result = await this.accountRepository.query(`
      select a.id as accountid, a.username ,a."isFirstLogin" ,a.status, a."isEmailActive",
      e.id as employeeid, e.fullname,t.id as teamid ,e.phone ,e.email ,e.address ,e.sex, e."teamRole", b.id as branchid, b."branchName" ,
      e."dateOfBirth", r."roleName", t."teamName"
      from account a
      join employee e on e."accountId" = a.id
      join "role" r on r.id = a."roleId"
      join team t on e."teamId" = t.id
      join branch b on t."branchId" = b.id
      where a.id = ${accountid} and r."roleName" = '${roleName}' 
      `);
    } else if (roleName === 'CUSTOMER') {
      result = await this.accountRepository.query(`
      select a.id as accountid, a.username , a."isFirstLogin" ,a.status, a."isEmailActive",
      r."roleName", c.id as customerid, c."name", c.phone ,c.email ,c.address ,c."isSignedContract",c."createAt", c."businessAreas",
      t."teamName" , t.status as teamstatus,t."teamName"  ,b."branchName" , b.status as statusbranch,b."branchName" ,b.id as branchid, t.id as teamid
      from account a
      join "role" r on a."roleId" = r.id
      join "customerAccount" ca on ca."accountId" = a.id
      join customer c on c.id = ca."customerId"
      join team t on t.id = c."teamId"
      join branch b on t."branchId" = b.id
      where a.id = ${accountid} and r."roleName" = '${roleName}' `);
    } else {
      result = await this.accountRepository.query(
        `select a.username,r."roleName", a.id as accountid
        from account a
        join "role" r on r.id = a."roleId"
        where a.id = ${accountid} and a.status = true`,
      );
    }
    return result;
  }

  async login(dto: LoginDto, res: Response) {
    const data = { role: '', data: null, status: true };
    await this.accountRepository
      .findOne({
        relations: { role: true },
        where: { username: dto.username },
      })
      .then(async (value) => {
        if (!value) {
          return;
        }
        if (await bcrypt.compare(dto.password, value.password)) {
          delete value.password;
          data.data = value;
          data.status = value.status;
          data.role = value.role.roleName;
        }
      });
    await this.employeeRepository
      .findOne({
        relations: { account: { role: true }, team: { branch: true } },
        where: [
          { email: dto.username },
          { phone: dto.username },
          { account: { username: dto.username } },
        ],
      })
      .then(async (value) => {
        if (!value) {
          return;
        }
        if (await bcrypt.compare(dto.password, value.account.password)) {
          delete value.account.password;
          data.data = value;
          data.status = value.account.status;
          data.role = value.account.role.roleName;
        }
      });
    await this.customerAccountRepository
      .findOne({
        relations: {
          customer: { team: { branch: true } },
          account: { role: true },
        },
        where: [
          { customer: { email: dto.username } },
          { customer: { phone: dto.username } },
          { account: { username: dto.username } },
        ],
      })
      .then(async (value) => {
        if (!value) {
          return;
        }
        if (await bcrypt.compare(dto.password, value.account.password)) {
          delete value.account.password;
          data.data = value;
          data.status = value.account.status;
          data.role = value.account.role.roleName;
        }
      });
    if (!data.status) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: AccountMessageEnum.ACCOUNT_BLOCK,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!data.data) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: AccountMessageEnum.ACCOUNT_OR_PASSWORD_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const mapper = new AccountMapper();
    const response = await mapper.entityToDtoLogin(data);

    return response;
  }

  async activeAccount(accountid: number) {
    const checkAccount = await this.isAccountExisted(accountid);
    if (checkAccount == null) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Tài khoản không tồn tại`,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      await this.accountRepository.query(`update account 
      set "isEmailActive" = true
      where id = ${accountid}`);
      return { message: `Cập nhật thành công` };
    }
  }

  async resendEmail(dto: ResendEmailDto) {
    try {
      const checkAccount = await this.isAccountExisted(dto.accountid);
      if (checkAccount == null) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: `Tài khoản không tồn tại`,
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        const newPasswordRandom = (await this.generateString(6)).toString();
        const hashedPassword = await bcrypt.hash(newPasswordRandom.trim(), 13);
        //find role
        const role = await this.accountRepository.query(`
      select r."roleName"  from account a 
      join "role" r on r.id = a."roleId" 
      where a.id = ${dto.accountid}
      `);
        //find username
        if (role[0].roleName == UserRole.CUSTOMER) {
          const data = await this.accountRepository.query(`
        update customer 
        set email = '${dto.email}'
        where id  = (select "customerId" from "customerAccount" where "accountId" = ${dto.accountid})`);
          const username = await this.accountRepository
            .query(`select a.username from account a 
          where a.id = ${dto.accountid}`);

          await this.accountRepository.query(`
        update account 
        set "password" = '${hashedPassword}'
        where id = ${dto.accountid}`);
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
                    <p>Xin chào </p>
                    <p>Chào mừng bạn đến với trung tâm hỗ trợ khách hàng của ITNow.</p>
                    <p>Dưới đây là thông tin đăng nhập ứng dụng ITnow. Bạn có thể truy cập bằng 2 cách</p>
                    <p>1)Quét mã QR hoặc hướng dẫn tải app.</p>
                    <p>2) Link đăng nhập web: </p>
                    <p>Username: ${username[0].username}</p>
                    <p>Password: ${newPasswordRandom}</p>
                    <p>3)Xác nhận email: <a href="http://45.117.79.186:3001/api/v1/accounts/active-account-by-email/${dto.accountid}">Xác minh ngay</a></p> 
                    <p>Nếu bạn cần thêm thông tin vui lòng gọi hotline: 0868.771.333 hoặc truy cập <a href="https://itnow.vn/lien-he/">https://itnow.vn/lien-he/</a> để được hỗ trợ nhanh nhất.</p>
                    <p>Trân trọng!</p>
                    <b>Công ty ITnow</b>
                </td>
            </tr>
      
        </table>`,
          };
          mail.sendMail(optionMail);
          return { message: `Thành công` };
        } else if (role[0].roleName == UserRole.EMPLOYEE) {
          await this.accountRepository.query(`
        update employee  
        set email = '${dto.email}'
        where "accountId" = ${dto.accountid}`);

          const username = await this.accountRepository
            .query(`select a.username from account a 
        where a.id = ${dto.accountid}`);

          await this.accountRepository.query(`
        update account 
        set "password" = '${hashedPassword}'
        where id = ${dto.accountid}`);
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
                    <p>Xin chào </p>
                    <p>Chào mừng bạn đến với trung tâm hỗ trợ khách hàng của ITNow.</p>
                    <p>Dưới đây là thông tin đăng nhập ứng dụng ITnow. Bạn có thể truy cập bằng 2 cách</p>
                    <p>1)Quét mã QR hoặc hướng dẫn tải app.</p>
                    <p>2) Link đăng nhập web: </p>
                    <p>Username: ${username[0].username}</p>
                    <p>Password: ${newPasswordRandom}</p>
                    <p>3)Xác nhận email: <a href="http://45.117.79.186:3001/api/v1/accounts/active-account-by-email/${dto.accountid}">Xác minh ngay</a></p> 
                    <p>Nếu bạn cần thêm thông tin vui lòng gọi hotline: 0868.771.333 hoặc truy cập <a href="https://itnow.vn/lien-he/">https://itnow.vn/lien-he/</a> để được hỗ trợ nhanh nhất.</p>
                    <p>Trân trọng!</p>
                    <b>Công ty ITnow</b>
                </td>
            </tr>
      
        </table>`,
          };
          mail.sendMail(optionMail);
          return { message: `Thành công` };
        }
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `System error`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async isAccountExisted(id: number): Promise<AccountEntity> {
    const property = await this.accountRepository.findOne({
      where: { id: id },
    });
    return property;
  }

  async changePassword(dto: ChangePasswordDTO, id: number) {
    const isAccountExisted = await this.isAccountExisted(id);

    if (isAccountExisted) {
      if (
        !(await bcrypt.compare(dto.old_password, isAccountExisted.password))
      ) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Mật khẩu cũ nhập sai.',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        const hashedPassword = await bcrypt.hash(dto.new_password, 13);
        dto.new_password = hashedPassword;
        const password = dto.new_password;
        const post = await this.accountRepository.update({ id }, { password });
        if (post.affected === 1) {
          return { message: 'Cập nhật mật khẩu thành công.' };
        } else {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Đã có lỗi xảy ra.',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: AccountMessageEnum.ACCOUNT_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  validation(username: string): Promise<AccountEntity> {
    const value = this.accountRepository.findOne({
      where: { username: username },
    });
    return value;
  }
  async register(accountDto: AccountDto) {
    const check = await this.validation(accountDto.username);
    if (check == null) {
      const hashedPassword = await bcrypt.hash(accountDto.password, 13);
      const mapper = new AccountMapper();
      const data = await this.accountRepository.save(
        mapper.dtoToEntityAccount(accountDto, hashedPassword),
      );
      const entityToDto = mapper.entityToDtoAccount(data);
      return entityToDto;
    }
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Tên người dùng đã tồn tại',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
