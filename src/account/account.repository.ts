import { HttpException, HttpStatus } from '@nestjs/common';
import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { ChangeAssignTo } from 'src/ticketAssign/dto/ticket-assign.dto';
import { TicketAssignEntity } from 'src/ticketAssign/entity/ticketassign.entity';
import { AssignEnums } from 'src/ticketAssign/enum/ticket-assign-enum';
import { In, Repository } from 'typeorm';
import { AccountEntity } from './entity/account.entity';
import { UserRole } from './enums/account-role-enums';

@CustomRepository(AccountEntity)
export class AccountRepository extends Repository<AccountEntity> {
  async checkExistAccountHasRoleCustomer(accountId: number) {
    const result = await this.findOne({
      where: {
        id: accountId,
        role: {
          roleName: UserRole.CUSTOMER,
        },
      },
    });
    if (!result) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Khách hàng không tồn tại!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return result;
  }
  async checkAssignorExist(id: number) {
    const check = await this.findOne({
      where: {
        id: id,
        status: true,
      },
    });
    if (!check) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: AssignEnums.ASSIGNOR_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkAssignToExist(id: number[]) {
    const check = await this.find({
      where: {
        id: In(id),
        role: {
          roleName: UserRole.EMPLOYEE,
        },
        status: true,
      },
    }); 

    if (check.length != id.length) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: AssignEnums.ASSIGN_TO_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async CheckAccountByUserName(username: string) {
    return await this.findOne({
      where: { username: username },
    });
  }

  async findByAccountId(accountId: number) {
    return await this.find({
      where: {
        id: accountId,
      },
    });
  }
}
