/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AbilityService } from 'src/ability/ability.service';
import {
  AddMoreAssign,
  AssignTicketDto,
  ChangeAssignTo,
} from './dto/ticket-assign.dto';
import { TicketassignService } from './ticketassign.service';
import { Action } from 'src/ability/ability.factory';
import { TeamEnum } from 'src/team/enums/team-enums';
import { UserRole } from 'src/account/enums/account-role-enums';
import { TeamRoleEnum } from 'src/employee/enums/employee-team-role.enums';
import { AssignEnums } from './enum/ticket-assign-enum';
import { RatingDto } from './dto/rating.dto';
import { TicketMessageEnums } from 'src/ticket/enums/ticket.enums';
@Controller({ path: 'ticketAssigns', version: '1' })
export class TicketAssignController {
  constructor(
    private readonly ticketAssignService: TicketassignService,
    private readonly authorService: AbilityService,
  ) {}

  @ApiTags('Ticket Assign')
  @Post()
  @ApiOperation({
    summary: 'Api allow admin, co-leader, leader assign ticket to team member',
  })
  async assignTicket(@Body() dto: AssignTicketDto, @Req() request: Request) {
    const authen = await this.authorService.authenticateToken(request);
    if (
      authen.user.roleName != UserRole.ADMIN &&
      authen.user.roleName != UserRole.EMPLOYEE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: AssignEnums.AUTHORIZED,
        },
        HttpStatus.FORBIDDEN,
      );
    } else if (authen.user.roleName == UserRole.EMPLOYEE) {
      if (authen.user.teamRole == TeamRoleEnum.MEMBER) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Bạn không có quyền hạn',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }
    if (!authen.user.status) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: TicketMessageEnums.ACCOUNT_BLOCK,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const roleName = authen.user.roleName;
    if (roleName != UserRole.ADMIN) {
      const teamRole = authen.user.teamRole;
      if (teamRole == TeamRoleEnum.MEMBER) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: AssignEnums.AUTHORIZED,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    dto.assignor = authen.user.accountId;
    return this.ticketAssignService.assignTicket(dto);
  }

  @ApiTags('Ratings')
  @Get('/ratings')
  @ApiOperation({
    summary: 'Api allow employee to get avg rating',
  })
  async getRating(@Req() request: Request) {
    const authen = await this.authorService.authenticateToken(request);
    const accountId = authen.user.accountId;
    return await this.ticketAssignService.getRating(accountId);
  }

  @ApiTags('Ratings')
  @Get('/ratings/list')
  @ApiOperation({
    summary: 'Api allow employee to get personal rating list',
  })
  async getRatingList(@Req() request: Request) {
    const authen = await this.authorService.authenticateToken(request);
    const accountId = authen.user.accountId;
    return await this.ticketAssignService.getRatingList(accountId);
  }

  @ApiTags('Ratings')
  @Get('/getListRating')
  @ApiOperation({
    summary: 'Api allow customer rating ',
  })
  async ratingList(@Req() request: Request) {
    const authen = await this.authorService.authenticateToken(request);
    if (authen.user.roleName != UserRole.ADMIN) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Quyền truy cập bị hạn chế!',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return this.ticketAssignService.getListRating();
  }

  @ApiTags('Ratings')
  @Post('/ratings')
  @ApiOperation({
    summary: 'Api allow customer rating ',
  })
  async rating(@Body() dto: RatingDto, @Req() request: Request) {
    const authen = await this.authorService.authenticateToken(request);
    if (authen.user.roleName != UserRole.CUSTOMER) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Quyền truy cập bị hạn chế.',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    dto.accountId = authen.user.accountId;
    return this.ticketAssignService.rating(dto);
  }

  @ApiTags('Ticket Assign')
  @Post('/addMore')
  @ApiOperation({
    summary: 'Api allow leader, co-leader, admin add more assign ',
  })
  async addMoreAssign(@Body() dto: AddMoreAssign, @Req() request: Request) {
    const authen = await this.authorService.authenticateToken(request);

    if (
      authen.user.roleName != UserRole.ADMIN &&
      authen.user.roleName != UserRole.EMPLOYEE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Quyền truy cập bị hạn chế!',
        },
        HttpStatus.FORBIDDEN,
      );
    } else if (authen.user.roleName == UserRole.EMPLOYEE) {
      if (authen.user.teamRole == TeamRoleEnum.MEMBER) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Bạn không có quyền hạn',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }
    dto.assignor = authen.user.accountId;
    return this.ticketAssignService.addMoreAssign(dto);
  }

  @ApiTags('Ticket Assign')
  @Get('/employees/:status/:numOfTicket')
  @ApiOperation({
    summary: 'Api allow employee get own ticket with status',
  })
  async getTicketAssignByEmployeeAndTeam(
    @Req() request: Request,
    @Param('status') status: string,
    @Param('numOfTicket') numOfTicket: number,
  ) {
    const authen = await this.authorService.authenticateToken(request);
    if (authen.user.roleName != UserRole.EMPLOYEE) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Quyền truy cập bị hạn chế!',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const employeeId = authen.user.accountId;
    return await this.ticketAssignService.getTicketAssignByEmployee(
      employeeId,
      status,
      numOfTicket,
    );
  }

  @ApiTags('Ticket Assign')
  @Get('/tickets/:id')
  @ApiOperation({
    summary: 'Api allow leader, co-leader, admin get ticket assigned ',
  })
  async getTicketAssignByTicketId(
    @Param('id') id: number,
    @Req() request: Request,
  ) {
    const authen = await this.authorService.authenticateToken(request);
    console.log(authen);
    if (
      authen.user.roleName != UserRole.ADMIN &&
      authen.user.roleName != UserRole.EMPLOYEE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Quyền truy cập bị hạn chế!',
        },
        HttpStatus.FORBIDDEN,
      );
    } else if (authen.roleName == UserRole.EMPLOYEE) {
      if (
        authen.user.teamRole != TeamRoleEnum.LEADER &&
        authen.user.teamRole != TeamRoleEnum.CO_LEADER
      ) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Quyền truy cập bị hạn chế!',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }
    return await this.ticketAssignService.getTicketAssignByTicketId(id);
  }

  @ApiTags('Ticket Assign')
  @Put('')
  @ApiOperation({
    summary: 'Api allow leader, co-leader, admin change member assigned ',
  })
  async changeAssignTo(@Body() dto: ChangeAssignTo, @Req() request: Request) {
    const authen = await this.authorService.authenticateToken(request);
    if (
      authen.user.roleName != UserRole.ADMIN &&
      authen.user.roleName != UserRole.EMPLOYEE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Quyền truy cập bị hạn chế!',
        },
        HttpStatus.FORBIDDEN,
      );
    } else if (authen.user.roleName == UserRole.EMPLOYEE) {
      if (authen.user.teamRole == TeamRoleEnum.MEMBER) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Bạn không có quyền hạn',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }
    return this.ticketAssignService.changeAssigned(dto, authen.user.accountId);
  }

  @ApiTags('Ticket Assign')
  @Delete('/:ticketid/:assignToid')
  @ApiOperation({
    summary: 'Api allow leader, co-leader, admin delete ticket assigned ',
  })
  async deleteTicketAssignByTicketIdAndAssignorId(
    @Param('ticketid') ticketid: number,
    @Param('assignToid') assignToid: number,
    @Req() request: Request,
  ) {
    const authen = await this.authorService.authenticateToken(request);
    if (
      authen.user.roleName != UserRole.ADMIN &&
      authen.user.roleName != UserRole.EMPLOYEE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Quyền truy cập bị hạn chế!',
        },
        HttpStatus.FORBIDDEN,
      );
    } else if (authen.roleName == UserRole.EMPLOYEE) {
      if (authen.user.teamRole == TeamRoleEnum.MEMBER) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Bạn không có quyền hạn',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }
    return await this.ticketAssignService.deleteAssignByTicketIdAndAssignorid(
      ticketid,
      assignToid,
    );
  }
  @ApiTags('Ticket Assign')
  @Delete('/:id')
  @ApiOperation({
    summary: 'Api allow leader, co-leader, admin delete ticket assigned ',
  })
  async deleteAssign(@Param('id') id: number, @Req() request: Request) {
    const authen = await this.authorService.authenticateToken(request);
    if (
      authen.user.roleName != UserRole.ADMIN &&
      authen.user.roleName != UserRole.EMPLOYEE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Quyền truy cập bị hạn chế!',
        },
        HttpStatus.FORBIDDEN,
      );
    } else if (authen.user.roleName == UserRole.EMPLOYEE) {
      if (
        authen.user.teamRole != TeamRoleEnum.LEADER &&
        authen.user.teamRole != TeamRoleEnum.CO_LEADER
      ) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Quyền truy cập bị hạn chế!',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }
    return await this.ticketAssignService.deleteAssign(
      id,
      authen.user.accountId,
    );
  }
}
