import { TicketMapper } from './mapper/ticket.mapper';
import { CreateTicketDto, TicketEnums } from './dto/create-ticket.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import { AccountRepository } from '../account/account.repository';
import { TicketMessageEnums } from './enums/ticket.enums';
import { AppGateway } from 'src/app.gateway';
import { TeamRepository } from '../team/team.repository';
import { ChangeStatusDto } from './dto/changeStatus.dto';
import { EntityManager, Repository } from 'typeorm';
import { TicketHistoryEntity } from 'src/ticketHistory/entity/tickethistory.entity';
import { TicketHistoryMapper } from 'src/ticketHistory/mapper/ticket-history.mapper';
import { TicketEntity } from './entity/ticket.entity';
import { TicketAssignRepository } from 'src/ticketAssign/ticketassign.repository';
import { Notification } from '../utils/notification';
import { TokenDeviceRepository } from '../tokenDevice/tokendevice.repository';
import { TicketTypeEnum } from 'src/service/enums/service-enums';
import { AccountMessageEnum } from 'src/account/enums/account-error-enums';
import { ServiceRepository } from 'src/service/service.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketCategoryEntity } from 'src/ticketCategory/entity/ticketcategory.entity';
import { ContractRepository } from 'src/contract/contract.repository';
@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly accountRepository: AccountRepository,
    private readonly teamRepo: TeamRepository,
    private readonly ticketAssignRepo: TicketAssignRepository,
    private gateway: AppGateway,
    private readonly entityManager: EntityManager,
    private readonly tokenDeviceRepository: TokenDeviceRepository,
    private readonly serviceRepo: ServiceRepository,
    @InjectRepository(TicketCategoryEntity)
    private readonly ticketCategoryRepo: Repository<TicketCategoryEntity>,
    private readonly contractRepo: ContractRepository,
    @InjectRepository(TicketHistoryEntity)
    private readonly ticketHistoryRepo: Repository<TicketHistoryEntity>,
  ) {}

  async getServiceName(ticketid: number) {
    return await this.ticketRepository.getServiceName(ticketid);
  }

  async totalTicketBySourceEveryMonth(time: string) {
    return await this.ticketRepository.totalTicketBySourceEveryMonth(time);
  }

  async totalOfTicketByTeamEveryMonth(time: string) {
    return await this.ticketRepository.totalOfTicketByTeamEveryMonth(time);
  }

  async numberOfTicketCompleteEveryMonth(time: string) {
    return await this.ticketRepository.numberOfTicketCompleteEveryMonthByEmployee(
      time,
    );
  }

  async numberOfServiceEveryMonth(time: string) {
    return await this.ticketRepository.numberOfServiceEveryMonth(time);
  }

  async getAllTicketByAdmin() {
    return await this.ticketRepository.getAllTicket();
  }

  async getNameAssignor(ticketid: number) {
    return await this.ticketRepository.getNameAssignor(ticketid);
  }

  async getNameAssignTo(ticketid: number) {
    return await this.ticketRepository.getNameAssignTo(ticketid);
  }

  async getTicketCategory(ticketid: number) {
    return await this.ticketRepository.getTicketCategory(ticketid);
  }

  async getCustomerNameAndTeamId(ticketid: number) {
    return await this.ticketRepository.getCustomerNameAndTeamId(ticketid);
  }

  async getTicketDetail() {
    const mapper = new TicketMapper(this);
    const data = await this.getAllTicketByAdmin();
    const newData = await mapper.fromTicketEntityToTicketList(data);

    return newData;
  }

  async getTicketDetailByEmployee(teamid: number) {
    const mapper = new TicketMapper(this);
    const data = await this.ticketRepository.getAllTicketByEmployee(teamid);
    const newData = await mapper.fromTicketEntityToTicketList(data);

    return newData;
  }

  async numberOfTicketEveryMonth(time: string) {
    return await this.ticketRepository.numberOfTicketEveryMonth(time);
  }

  async avgTicketEveryMothOfTeam(time: string) {
    return await this.ticketRepository.avgTicketEveryMonthOfTeam(time);
  }

  async avgTicketEveryMonthByCustomer(time: string) {
    const data = await this.ticketRepository.avgTicketEveryMonthByCustomer(
      time,
    );
    return data;
  }

  async getTeamIdByCustomer(accountid: number) {
    return await this.ticketRepository.getTeamIdByCustomer(accountid);
  }

  async getTeamIdByEmployee(accountid: number) {
    return await this.ticketRepository.getTeamIdByEmployee(accountid);
  }

  async getTicketByTeamId(teamid: number) {
    return await this.ticketRepository.getTicketByTeamId(teamid);
  }

  async checkService(serviceId: number) {
    console.log(serviceId);

    const service = await this.serviceRepo.findService(serviceId);
    console.log(service);

    if (service == null) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Dịch vụ không tồn tại.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findTokenDeviceRepository(ticketId: number) {
    return await this.tokenDeviceRepository.findTokenDevice(ticketId);
  }

  async checkTicketCategory(ticketCategoryId: number) {
    const result = await this.ticketCategoryRepo.findOne({
      where: {
        id: ticketCategoryId,
      },
    });
    if (result == null) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Loại yêu cầu không tồn tại.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return result;
  }

  async checkExistServiceInContract(accountId: number, serviceId: number) {
    const result = await this.contractRepo.findServiceExistInContract(
      accountId,
      serviceId,
    );
    if (result[0].count < 1) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Hợp đồng của bạn không có dịch vụ này.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createTicket(dto: CreateTicketDto) {
    await this.checkAccount(dto.accountId);
    await this.checkService(dto.serviceId);
    const ticketCategory = await this.checkTicketCategory(dto.ticketCategoryId);
    if (ticketCategory.isRelativeToContract) {
      await this.checkExistServiceInContract(dto.accountId, dto.serviceId);
    }

    const mapper = new TicketMapper(this);

    const entity = await this.ticketRepository.save(
      mapper.dtoToEntityTicket(dto),
    );

    const ticketid = mapper.entityToDtoTicket(entity);

    this.gateway.wss.emit('newTicket', dto);
    const notification = new Notification();
    // get token from repository
    const findTokenDevice = await this.findTokenDeviceRepository(
      ticketid.ticketId,
    );
    const arrEmp = [];
    await findTokenDevice.map((value) => arrEmp.push(value.token));
    await notification
      .notification(arrEmp, 'IT Now', 'Khách hàng đã gửi một yêu cầu')
      .catch((err) => {
        console.log(err);
      });
    return { message: 'Yêu cầu đã được gửi !' };
  }

  async checkExistAccount(accountId: number) {
    await this.accountRepository.checkExistAccountHasRoleCustomer(accountId);
  }

  async customerGetTicketByAccount(accountId: number, numberOfTicket: number) {
    await this.checkAccount(accountId);
    return await this.ticketRepository.customerGetTicketByAccount(
      accountId,
      numberOfTicket,
    );
  }

  async checkTeamExist(teamId: number) {
    const team = await this.teamRepo.findTeamById(teamId);
    if (!team) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Team không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async teamGetTicketWithStatus(
    teamId: number,
    status: string,
    numOfTicket: number,
    accountId: number,
  ) {
    await this.checkTeamExist(teamId);
    await this.checkAccount(accountId);
    const countTicket = await this.ticketRepository.countByTeamAndStatus(
      teamId,
      status,
    );
    let offset = 0;
    if (countTicket > numOfTicket) {
      offset = countTicket - numOfTicket;
    }
    let listTicketResult = [];
    if (numOfTicket == -1) {
      listTicketResult = await this.ticketRepository.findByTeamAndStatus(
        teamId,
        status,
      );
    } else {
      listTicketResult = await this.ticketRepository.findByTeamAndStatusPaging(
        teamId,
        status,
        offset,
        numOfTicket,
      );
    }

    for (let i = 0; i < listTicketResult.length; i++) {
      const listAssignTo = await this.ticketAssignRepo.findByTicketId(
        listTicketResult[i].ticketid,
      );
      listTicketResult[i].listAssignTo = listAssignTo;
    }
    return listTicketResult;
  }

  async changStatusToProcessing(dto: ChangeStatusDto) {
    let prevStatus = [];
    prevStatus.push(TicketEnums.APPROVE);
    const checkPrevTicketExist =
      await this.ticketRepository.findTicketWithTicketIdAndStatus(
        dto.ticketId,
        prevStatus,
      );

    if (checkPrevTicketExist.length == 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Yêu cầu không còn ở trạng thái đã chấp nhận.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const ticketHisMapper = new TicketHistoryMapper();
    await this.entityManager.transaction(
      async (transactionManager: EntityManager) => {
        const ticketHistoryEntity =
          await ticketHisMapper.fromChangeStatusDtoToEntity(dto);
        transactionManager.save(TicketHistoryEntity, ticketHistoryEntity);
        transactionManager.update(TicketEntity, dto.ticketId, {
          status: dto.status,
        });
      },
    );
    return { message: 'Đã chuyển đến xử lý.' };
  }

  async changeStatusToWaiting(dto: ChangeStatusDto) {
    let prevStatus = [];
    prevStatus.push(TicketEnums.PROCESSING);
    const checkPrevTicketExist =
      await this.ticketRepository.findTicketWithTicketIdAndStatus(
        dto.ticketId,
        prevStatus,
      );
    if (checkPrevTicketExist.length == 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Yêu cầu không còn ở trạng thái đang xử lý.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const ticketHisMapper = new TicketHistoryMapper();
    await this.entityManager.transaction(
      async (transactionManager: EntityManager) => {
        const ticketHistoryEntity =
          await ticketHisMapper.fromChangeStatusDtoToEntity(dto);
        transactionManager.save(TicketHistoryEntity, ticketHistoryEntity);
        transactionManager.update(TicketEntity, dto.ticketId, {
          status: dto.status,
        });
      },
    );
    return { message: 'Đã chuyển đến chờ xác nhận hoàn thành.' };
  }

  async changeStatusToCancel(dto: ChangeStatusDto) {
    let prevStatus = [];
    prevStatus = [
      TicketEnums.PENDING,
      TicketEnums.APPROVE,
      TicketEnums.PROCESSING,
    ];
    const checkPrevTicketExist =
      await this.ticketRepository.findTicketWithTicketIdAndStatus(
        dto.ticketId,
        prevStatus,
      );

    if (checkPrevTicketExist.length == 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Yêu cầu không thể hủy.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const ticketHisMapper = new TicketHistoryMapper();
    await this.entityManager.transaction(
      async (transactionManager: EntityManager) => {
        const ticketHistoryEntity =
          await ticketHisMapper.fromChangeStatusDtoToEntity(dto);
        transactionManager.save(TicketHistoryEntity, ticketHistoryEntity);
        transactionManager.update(TicketEntity, dto.ticketId, {
          status: dto.status,
        });
      },
    );
    return { message: 'Hủy yêu cầu thành công.' };
  }

  async checkTicketAssignExist(dto: ChangeStatusDto) {
    const checkTicketExist = await this.ticketAssignRepo.findByTicketId(
      dto.ticketId,
    );
    if (checkTicketExist.length == 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Yêu cầu này không còn giao cho bạn.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkTicketExist(dto: ChangeStatusDto) {
    const checkTicketExist = await this.ticketRepository.findByTicketId(
      dto.ticketId,
    );
    if (checkTicketExist.length == 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Yêu cầu không tồn tại.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async changeStatus(dto: ChangeStatusDto) {
    await this.checkAccount(dto.accountId);
    if (dto.status === TicketEnums.CANCELED) {
      await this.checkTicketExist(dto);
    } else {
      await this.checkTicketAssignExist(dto);
    }
    if (dto.status == TicketEnums.PROCESSING) {
      return await this.changStatusToProcessing(dto);
    } else if (dto.status == TicketEnums.WAITCOMPLETE) {
      return await this.changeStatusToWaiting(dto);
    } else if (dto.status == TicketEnums.CANCELED) {
      return await this.changeStatusToCancel(dto);
    }
  }

  async checkAccount(accountId: number) {
    const account = await this.accountRepository.findByAccountId(accountId);
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

  async getDetailByCustomerAccountAndTicket(
    accountId: number,
    ticketId: number,
  ) {
    await this.checkAccount(accountId);
    const ticketInfo = await this.ticketRepository.findByTicketId(ticketId);
    const ticketHistory = await this.ticketHistoryRepo.find({
      where: {
        ticket: {
          id: ticketId,
        },
      },
    });
    return { ticketInfo: ticketInfo[0], ticketHistory: ticketHistory };
  }
}
