import { TokenDeviceRepository } from './../tokenDevice/tokendevice.repository';
/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Notification } from '../utils/notification';
import { TicketEnums } from 'src/ticket/dto/create-ticket.dto';
import { TicketEntity } from 'src/ticket/entity/ticket.entity';
import { TicketHistoryEntity } from 'src/ticketHistory/entity/tickethistory.entity';
import { TicketHistoryMapper } from 'src/ticketHistory/mapper/ticket-history.mapper';
import { EntityManager, In, Repository } from 'typeorm';

import {
  AddMoreAssign,
  AssignTicketDto,
  ChangeAssignTo,
} from './dto/ticket-assign.dto';
import { TicketAssignEntity } from './entity/ticketassign.entity';
import { AssignEnums } from './enum/ticket-assign-enum';
import { TicketAssignMapper } from './mapper/ticket-assign.mapper';
import { TicketRepository } from '../ticket/ticket.repository';
import { AccountRepository } from 'src/account/account.repository';
import { TicketAssignRepository } from './ticketassign.repository';
import { RatingDto } from './dto/rating.dto';
import { Helper } from 'src/helper/helper';
import { AppGateway } from 'src/app.gateway';
import { AccountMessageEnum } from 'src/account/enums/account-error-enums';

@Injectable()
export class TicketassignService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly ticketRepo: TicketRepository,
    private readonly accountRepo: AccountRepository,
    private readonly tokenDeviceRepo: TokenDeviceRepository,
    private readonly ticketAssignRepo: TicketAssignRepository,
    private gateway: AppGateway,
  ) {}

  async checkExistTicket(id: number) {
    return await this.ticketRepo.checkExistTicket(id);
  }

  async getRating(accountId: number) {
    await this.checkAccount(accountId);
    const result = await this.ticketAssignRepo.getPersonalRating(accountId);
    console.log(result);
    return result[0];
  }
  async getRatingList(accountId: number) {
    await this.checkAccount(accountId);
    return await this.ticketAssignRepo.getPersonalRatingList(accountId);
  }

  async getListRating() {
    return await this.ticketAssignRepo.getListRating();
  }

  async checkAssignToExist(id: number[]) {
    await this.accountRepo.checkAssignToExist(id);
  }

  async checkAssignedExist(id: number) {
    const result = await this.ticketAssignRepo.findById(id);
  }

  async checkTime(ticket: TicketEntity, expectedTimeComplete: Date) {
    const date1 = new Date(ticket.createAt);
    const date2 = new Date(expectedTimeComplete);

    if (date1.getTime() >= date2.getTime()) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: AssignEnums.EXPECTED_TIME_ERROR,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //findtoken device
  async findTokenDeviceRepository(ticketId: number) {
    return await this.tokenDeviceRepo.findTokenDevice(ticketId);
  }

  async checkTicketIsPendingStatus(ticketId: number) {
    const result = await this.ticketRepo.findTicketWithTicketIdAndStatus(
      ticketId,
      [TicketEnums.PENDING],
    );
    if (result.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Yêu cầu đã được giao trước đó rồi',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async assignTicket(dto: AssignTicketDto) {
    await this.checkTicketIsPendingStatus(dto.ticketId);
    const ticket = await this.checkExistTicket(dto.ticketId);
    await this.checkAccount(dto.assignor);
    await this.checkAssignToExist(dto.assignTo);
    await this.checkTime(ticket, dto.expectedTimeComplete);
    try {
      await this.entityManager.transaction(
        async (transactionManager: EntityManager) => {
          await transactionManager.update(TicketEntity, dto.ticketId, {
            status: TicketEnums.APPROVE,
            expectedTimeComplete: dto.expectedTimeComplete,
            priority: dto.priority,
          });
          const ticketAssignMapper = new TicketAssignMapper();

          const listTicketAssignEntity =
            await ticketAssignMapper.dtoToListTicketAssignEntity(dto);
          const ticketHistoryMapper = new TicketHistoryMapper();

          await transactionManager.save(
            TicketAssignEntity,
            listTicketAssignEntity,
          );

          const notification = new Notification();
          // get token from repository
          const findTokenDevice = await this.findTokenDeviceRepository(
            dto.ticketId,
          );

          const findTokenDeviceForCustomer =
            await this.tokenDeviceRepo.findTokenDeviceForCustomer(dto.ticketId);
          //NOTIFICATION TO CUSTOMER
          const arrCustomer = [];
          await findTokenDeviceForCustomer.map((value) =>
            arrCustomer.push(value.token),
          );

          await notification
            .notification(
              arrCustomer,
              'IT Now',
              'Yêu cầu của bạn đã được chấp nhận. Dự kiến hoàn thành lúc: ' +
                Helper.convertToLocaleDateShow(
                  new Date(dto.expectedTimeComplete),
                ),
            )
            .catch((err) => {
              console.log(err);
            });

          //NOTIFICATION TO EMPLOYEE
          const arrEmployee = [];
          await findTokenDevice.map((value) => arrEmployee.push(value.token));

          await notification
            .notification(
              arrEmployee,
              'IT Now',
              'Bạn được giao một yêu cầu mới',
            )
            .catch((err) => {
              console.log(err);
            });
          //save ticket history when assign success
          const ticketHistoryEntity =
            await ticketHistoryMapper.fromAssignTicketToTicketHistoryEntity(
              dto,
            );
          await transactionManager.save(
            TicketHistoryEntity,
            ticketHistoryEntity,
          );
        },
      );
      return { message: `Giao ticket thành công.` };
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Đã có lỗi xảy ra.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getTicketAssignByEmployee(
    accountId: number,
    status: string,
    numOfTicket: number,
  ) {
    await this.checkAccount(accountId);
    if (numOfTicket != -1) {
      const countTicket =
        await this.ticketAssignRepo.findAndCountByEmployeeAcountAndStatus(
          accountId,
          status,
        );
      let offset = 0;
      if (countTicket > numOfTicket) {
        offset = countTicket - offset;
      }
      return await this.ticketAssignRepo.findByEmployeeAndStatusAndPaging(
        accountId,
        status,
        offset,
        numOfTicket,
      );
    } else {
      return await this.ticketAssignRepo.findByEmployeeAccountNoPaging(
        accountId,
        status,
      );
    }
  }

  async deleteAssign(id: number, accountId: number) {
    await this.checkAccount(accountId);
    await this.checkAssignedExist(id);
    const result = await this.ticketAssignRepo.deleteAssigned(id);
    if (result.affected == 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Người này không còn được giao cho yêu cầu này.',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return { message: 'Xóa thành công' };
    }
  }

  async deleteAssignByTicketIdAndAssignorid(
    ticketid: number,
    assignToid: number,
  ) {
    const result =
      await this.ticketAssignRepo.deleteAssignByTicketIdAndAssignor(
        ticketid,
        assignToid,
      );

    if (result[1] == 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Người này không còn được giao cho yêu cầu này.',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return { message: 'Xóa thành công' };
    }
  }

  async getTicketAssignByTicketId(id: number) {
    return this.ticketAssignRepo.findByTicketId(id);
  }

  async checkExistByTicketIdAndAssignToId(
    ticketId: number,
    assignToId: number,
  ) {
    const result = await this.ticketAssignRepo.findByTicketIdAndAssignToId(
      ticketId,
      assignToId,
    );
    if (result.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Người này không còn được giao cho yêu cầu này.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async addMoreAssign(dto: AddMoreAssign) {
    await this.checkAccount(dto.assignor);
    await this.checkExistTicket(dto.ticketId);
    await this.checkAssignToExist([dto.assignTo]);
    const mapper = new TicketAssignMapper();
    return await this.ticketAssignRepo.save(
      await mapper.addMoreDtoToAssignEntity(dto),
    );
  }

  async changeAssigned(dto: ChangeAssignTo, accountId: number) {
    await this.checkAccount(accountId);
    await this.checkAssignedExist(dto.ticketAssignId);
    const mapper = new TicketAssignMapper();
    return await this.ticketAssignRepo.updateTicketAssign(
      await mapper.changeAssignDtoToEntity(dto),
    );
  }

  async checkAccount(accountId: number) {
    const account = await this.accountRepo.findByAccountId(accountId);
    if (account.length == 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: AccountMessageEnum.ACCOUNT_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      if (!account[0].status) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: AccountMessageEnum.ACCOUNT_BLOCK,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async checkTicketStatusIsWaitingComplete(ticketId: number) {
    const result = await this.ticketRepo.findTicketWithTicketIdAndStatus(
      ticketId,
      [TicketEnums.WAITCOMPLETE],
    );
    if (result.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Yêu cầu không còn ở trạng thái chờ xác nhận hoàn thành nữa.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async rating(dto: RatingDto) {
    await this.checkAccount(dto.accountId);
    await this.checkTicketStatusIsWaitingComplete(dto.ticketId);
    const date = new Date();
    try {
      await this.entityManager.transaction(
        async (transactionManager: EntityManager) => {
          await transactionManager.query(
            `update "ticketAssign" 
          set "ratingStar" = ${dto.star},"ratingDescription" = '${
              dto.description
            }', "ratingAt" = '${
              date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
            }', "ratingStatus" = true
          where "ticketId" = ${dto.ticketId}`,
          );
          await transactionManager.query(`update ticket 
            set status = '${TicketEnums.COMPLETE}' 
            where id = ${dto.ticketId}`);
          const mapper = new TicketHistoryMapper();
          const ticketHistoryEntity = await mapper.ratingDtoToEntity(dto);
          await transactionManager.save(
            TicketHistoryEntity,
            ticketHistoryEntity,
          );
        },
      );
      this.gateway.wss.emit('newTicket', dto);
      return { message: 'Đánh giá thành công!' };
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Đã có lỗi xảy ra',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
