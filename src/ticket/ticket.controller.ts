import { CreateTicketDto, TicketEnums } from './dto/create-ticket.dto';
import { TicketService } from './ticket.service';
/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AbilityService } from 'src/ability/ability.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Action } from 'src/ability/ability.factory';
import { TeamEnum } from 'src/team/enums/team-enums';
import { UserRole } from 'src/account/enums/account-role-enums';
import { TicketMessageEnums } from './enums/ticket.enums';
import { ChangeStatusDto } from './dto/changeStatus.dto';
import { AccountService } from '../account/account.service';
import { TeamRoleEnum } from 'src/employee/enums/employee-team-role.enums';
@Controller({ path: 'tickets', version: '1' })
export class TicketController {
  constructor(
    private helperService: AbilityService,
    private ticketService: TicketService,
  ) {}
  @ApiTags('Ticket')
  @Get('/customers/:numOfTicket')
  @ApiOperation({
    summary: 'Api get all ticket of customer by account',
  })
  async getTicketByAccount(
    @Req() request: Request,
    @Param('numOfTicket') numOfTicket: number,
  ) {
    const author = await this.helperService.authenticateToken(request);
    if (author.user.roleName !== UserRole.CUSTOMER) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: TicketMessageEnums.LIMIT_ACCESS_DATA,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.ticketService.customerGetTicketByAccount(
      author.user.accountId,
      numOfTicket,
    );
  }

  @ApiTags('Ticket')
  @Get('/customers/detail/:ticketId')
  @ApiOperation({
    summary: 'Api get all ticket of customer by account',
  })
  async getTicketDetailByCustomerAccount(
    @Req() request: Request,
    @Param('ticketId') ticketId: number,
  ) {
    const author = await this.helperService.authenticateToken(request);
    if (author.user.roleName !== UserRole.CUSTOMER) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: TicketMessageEnums.LIMIT_ACCESS_DATA,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.ticketService.getDetailByCustomerAccountAndTicket(
      author.user.accountId,
      ticketId,
    );
  }

  @ApiTags('Ticket')
  @Post()
  @ApiOperation({
    summary: 'Api send ticket for employee support',
  })
  async create(@Body() ticketDto: CreateTicketDto, @Req() request: Request) {
    //check ability
    const data = await this.helperService.authenticateToken(request);

    if (!data.user.status) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: TicketMessageEnums.ACCOUNT_BLOCK,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.ticketService.createTicket(ticketDto);
  }
  @ApiTags('Ticket')
  @Get('byCustomer')
  @ApiOperation({
    summary: 'Api get ticket by customer by teamid',
  })
  async getTicketByCustomer(@Req() request: Request) {
    //check ability
    const data = await this.helperService.authenticateToken(request);
    const accountid = data.user.accountId;
    //get teamid
    const teamid = await this.ticketService.getTeamIdByCustomer(accountid);
    if (teamid.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: TicketMessageEnums.AUTHORIZED_CUSTOMER,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const allListTicket = await this.ticketService.getTicketByTeamId(
      teamid[0].teamid,
    );
    if (allListTicket.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: TicketMessageEnums.ACCOUNT_BLOCK,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return allListTicket;
  }
  @ApiTags('Ticket')
  @Get('byEmployee')
  @ApiOperation({
    summary: 'Api get ticket by employee by teamid',
  })
  async getTicketByEmployee(@Req() request: Request) {
    //check ability
    const data = await this.helperService.authenticateToken(request);
    const accountid = data.user.accountId;
    const teamid = await this.ticketService.getTeamIdByEmployee(accountid);
    if (teamid.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: TicketMessageEnums.ACCOUNT_BLOCK,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    
    const allListTicket = await this.ticketService.getTicketDetailByEmployee(
      teamid[0].teamId,
    );

    return allListTicket;
  }

  @ApiTags('Ticket')
  @Get()
  @ApiOperation({
    summary: 'Api get all ticket, only admin can use this func',
  })
  async getAllListTicket(@Req() request: Request) {
    //check ability
    const ability = this.helperService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Create, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: TicketMessageEnums.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.ticketService.getTicketDetail();
  }

  @ApiTags('Ticket')
  @Get('/teams/:status/:numOfTicket')
  @ApiOperation({
    summary: 'Api team get ticket by status',
  })
  async teamGetTicketByStatus(
    @Param('status') status: string,
    @Param('numOfTicket') numOfTicket: number,
    @Req() request: Request,
  ) {
    const authen = await this.helperService.authenticateToken(request);
    const teamId = authen.user.teamId;
    return this.ticketService.teamGetTicketWithStatus(
      teamId,
      status,
      numOfTicket,
      authen.user.accountId,
    );
  }

  @ApiTags('Ticket')
  @Put()
  @ApiOperation({
    summary: 'Api change status ticket',
  })
  async changeStatus(@Req() request: Request, @Body() dto: ChangeStatusDto) {
    const authen = await this.helperService.authenticateToken(request);
    const roleName = authen.user.roleName;
    if (roleName != UserRole.ADMIN && roleName != UserRole.EMPLOYEE) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hạn chế quyền truy cập!',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (dto.status == TicketEnums.CANCELED) {
      if (roleName == UserRole.EMPLOYEE) {
        if (authen.user.teamRole == TeamRoleEnum.MEMBER) {
          throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              error: 'Bạn không có quyền hủy yêu cầu',
            },
            HttpStatus.FORBIDDEN,
          );
        }
      }
    }
    dto.accountId = authen.user.accountId;
    return await this.ticketService.changeStatus(dto);
  }

  @ApiTags('Ticket')
  @Get('/averageTicketByCustomer/:time')
  @ApiOperation({
    summary:
      'Api get all ticket of customer every month, only admin can use this func',
  })
  async avgTicketEveryMonth(
    @Req() request: Request,
    @Param('time') time: string,
  ) {
    const author = await this.helperService.authenticateToken(request);

    if (
      author.user.roleName == UserRole.ADMIN ||
      author.user.roleName == UserRole.EMPLOYEE
    ) {
      return this.ticketService.avgTicketEveryMonthByCustomer(time);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hạn chế quyền truy cập!',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @ApiTags('Ticket')
  @Get('/averageTicketByTeam/:time')
  @ApiOperation({
    summary:
      'Api get all ticket of team every month, only admin can use this func',
  })
  async avgTicketEveryMothOfTeam(
    @Req() request: Request,
    @Param('time') time: string,
  ) {
    const author = await this.helperService.authenticateToken(request);
    if (
      author.user.roleName == UserRole.ADMIN ||
      author.user.roleName == UserRole.EMPLOYEE
    ) {
      return this.ticketService.avgTicketEveryMothOfTeam(time);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hạn chế quyền truy cập!',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @ApiTags('Ticket')
  @Get('/numberOfTicketByCustomer/:time')
  @ApiOperation({
    summary:
      'Api get all number of ticket every month, only admin can use this func',
  })
  async numberOfTicketEveryMonth(
    @Req() request: Request,
    @Param('time') time: string,
  ) {
    const author = await this.helperService.authenticateToken(request);
    if (
      author.user.roleName == UserRole.ADMIN ||
      author.user.roleName == UserRole.EMPLOYEE
    ) {
      return this.ticketService.numberOfTicketEveryMonth(time);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hạn chế quyền truy cập!',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @ApiTags('Ticket')
  @Get('/numberOfService/:time')
  @ApiOperation({
    summary:
      'Api get all number of service every month, only admin can use this func',
  })
  async numberOfServiceEveryMonth(
    @Req() request: Request,
    @Param('time') time: string,
  ) {
    const author = await this.helperService.authenticateToken(request);
    if (
      author.user.roleName == UserRole.ADMIN ||
      author.user.roleName == UserRole.EMPLOYEE
    ) {
      return this.ticketService.numberOfServiceEveryMonth(time);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hạn chế quyền truy cập!',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @ApiTags('Ticket')
  @Get('/numberOfTicketCompleteByEmployee/:time')
  @ApiOperation({
    summary:
      'Api get all number of ticket complete by employee every month, only admin can use this func',
  })
  async numberOfTicketCompleteEveryMonth(
    @Req() request: Request,
    @Param('time') time: string,
  ) {
    const author = await this.helperService.authenticateToken(request);
    if (
      author.user.roleName == UserRole.ADMIN ||
      author.user.roleName == UserRole.EMPLOYEE
    ) {
      return this.ticketService.numberOfTicketCompleteEveryMonth(time);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hạn chế quyền truy cập!',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @ApiTags('Ticket')
  @Get('/totalTicketOfTeam/:time')
  @ApiOperation({
    summary:
      'Api get all total of ticket of team every month, only admin can use this func',
  })
  async totalOfTicketByTeamEveryMonth(
    @Req() request: Request,
    @Param('time') time: string,
  ) {
    const author = await this.helperService.authenticateToken(request);
    if (
      author.user.roleName == UserRole.ADMIN ||
      author.user.roleName == UserRole.EMPLOYEE
    ) {
      return this.ticketService.totalOfTicketByTeamEveryMonth(time);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hạn chế quyền truy cập!',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @ApiTags('Ticket')
  @Get('/totalTicketBySource/:time')
  @ApiOperation({
    summary:
      'Api get all total of ticket by source every month, only admin can use this func',
  })
  async totalTicketBySourceEveryMonth(
    @Req() request: Request,
    @Param('time') time: string,
  ) {
    const author = await this.helperService.authenticateToken(request);
    if (
      author.user.roleName == UserRole.ADMIN ||
      author.user.roleName == UserRole.EMPLOYEE
    ) {
      return this.ticketService.totalTicketBySourceEveryMonth(time);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hạn chế quyền truy cập!',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
