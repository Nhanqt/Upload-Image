import { AbilityService } from './../ability/ability.service';
/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Action } from 'src/ability/ability.factory';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { EmployeeMessageEnum } from './enums/employee-enums';
import { UpdateTeamRoleDto } from './dto/update-teamRole.dto';

@Controller({ path: 'employees', version: '1' })
export class EmployeeController {
  constructor(
    private employeeService: EmployeeService,
    private abilityService: AbilityService,
  ) {}

  @ApiTags('Employee')
  @Get('/teams')
  @ApiOperation({
    summary: 'Api employee get member in own team',
  })
  async getByTeam(@Req() request: Request) {
    const authen = await this.abilityService.authenticateToken(request);
    if (authen.user.roleName != 'EMPLOYEE') {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hạn chế quyền truy cập',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.employeeService.getEmpByTeam(authen.user.teamId);
  }

  @ApiTags('Employee')
  @ApiOperation({
    summary: 'Api view employees and is authorized, only admin can view',
  })
  @ApiQuery({
    name: 'take',
    type: Number,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'skip',
    type: Number,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'name',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'email',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'teamRole',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'teamName',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'branchName',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'sex',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @Get('paged')
  async paged(
    @Req() request: Request,
    @Query('take')
    take?: number,
    @Query('skip')
    skip?: number,
    @Query('name')
    name?: string,
    @Query('email')
    email?: string,
    @Query('teamRole')
    teamRole?: string,
    @Query('teamName')
    teamName?: string,
    @Query('branchName')
    branchName?: string,
    @Query('status')
    status?: string,
    @Query('sex')
    sex?: string,
  ) {
    // check ability
    await this.abilityService.authenticateToken(request);
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Create, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: EmployeeMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.employeeService.pagedEmployee(
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
  }
  @ApiTags('Employee')
  @ApiOperation({
    summary: 'Api view employees and is authorized, only leader can view',
  })
  @ApiQuery({
    name: 'take',
    type: Number,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'skip',
    type: Number,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'name',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'email',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'teamRole',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'teamId',
    type: Number,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'sex',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @Get('paged-by-team-id')
  async pagedByTeamId(
    @Req() request: Request,
    @Query('take')
    take?: number,
    @Query('skip')
    skip?: number,
    @Query('name')
    name?: string,
    @Query('email')
    email?: string,
    @Query('teamRole')
    teamRole?: string,
    @Query('teamId')
    teamId?: number,
    @Query('status')
    status?: string,
    @Query('sex')
    sex?: string,
  ) {
    // check ability
    const user = await this.abilityService.authenticateToken(request);  
    await this.abilityService.authenIsLeader(user);
    const ability = this.abilityService.authenRoleEmployee(request);
    const isAllow = (await ability).can(Action.Read, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: EmployeeMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.employeeService.pagedEmployeeByTeamId(
      take,
      skip,
      name,
      email,
      teamRole,
      teamId,
      status,
      sex,
    );
  }
  @ApiTags('Employee')
  @Post()
  @ApiOperation({
    summary: 'Api creates employees and is authorized, only admin can create',
  })
  async create(@Body() body: CreateEmployeeDto, @Req() request: Request) {
    // check ability
    await this.abilityService.authenticateToken(request);
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Create, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: EmployeeMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.employeeService.createEmployee(body);
  }
  @ApiTags('Employee')
  @Put()
  @ApiOperation({
    summary: 'Api updates employees and is authorized, only admin can update',
  })
  async update(@Body() body: UpdateEmployeeDto, @Req() request: Request) {
    // check ability
    await this.abilityService.authenticateToken(request);
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Update, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: EmployeeMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.employeeService.updateEmployee(body);
  }
  @ApiTags('Employee')
  @ApiOperation({
    summary: 'Api Update team role. only leader can use this func',
  })
  @Put('update-team-role')
  async updateTeamRole(
    @Req() request: Request,
    @Body() body: UpdateTeamRoleDto,
  ) {
    const authen = await this.abilityService.authenticateToken(request);
    if (authen.user.teamRole != 'LEADER') {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hạn chế quyền truy cập',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.employeeService.updateTeamRole(body);
  }

  @ApiTags('Employee')
  @ApiOperation({
    summary: 'Api block employees and is authorized, only admin can block',
  })
  @Put('update-status')
  @ApiQuery({
    name: 'id',
    type: Number,
    description: 'A parameter. Require',
    required: true,
  })
  @ApiQuery({
    name: 'status',
    type: String,
    description: 'A parameter. Require',
    required: true,
  })
  async updateStatus(
    @Query('id') id: number,
    @Query('status') status: string,
    @Req() request: Request,
  ) {
    // check ability
    await this.abilityService.authenticateToken(request);
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Create, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: EmployeeMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.employeeService.changeStatusEmployee(id, status);
  }
  @ApiTags('Employee')
  @Get('/:param')
  @ApiOperation({
    summary:
      'Api search employee by email or by name, only admin can use this function',
  })
  async searchEmployeeById(
    @Req() request: Request,
    @Param('param') param: string,
  ) {
    // check ability
    await this.abilityService.authenticateToken(request);
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Read, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: EmployeeMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.employeeService.findEmployeeByNameOrEmail(param);
  }
  @ApiTags('Employee')
  @Get()
  @ApiOperation({
    summary:
      'Api get all employees, author and authen, only admin can use this func',
  })
  async getAllEmployees(@Req() request: Request) {
    // check ability
    await this.abilityService.authenticateToken(request);
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Read, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: EmployeeMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.employeeService.getAllListEmployee();
  }
}
