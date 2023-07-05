import { AbilityService } from './../ability/ability.service';
import { CustomerService } from './customer.service';
/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Post,
  Req,
  HttpException,
  HttpStatus,
  Put,
  Query,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { Action } from 'src/ability/ability.factory';
import { Request } from 'express';
import { CustomerMessageEnum } from './enums/customer-enums';

@Controller({ path: 'customers', version: '1' })
export class CustomerController {
  constructor(
    private customerService: CustomerService,
    private abilityService: AbilityService,
  ) {}
  @ApiTags('Customer')
  @ApiOperation({
    summary: 'Api view customer and authorized, only admin can view',
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
    name: 'teamName',
    type: Number,
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
    @Query('teamName')
    teamName?: string,
    @Query('branchName')
    branchName?: string,
    @Query('status')
    status?: string,
  ) {
    try {
      await this.abilityService.authenticateToken(request);
      const ability = this.abilityService.authenRoleAdmin(request);
      const isAllow = (await ability).can(Action.Read, 'all');
      if (!isAllow) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: CustomerMessageEnum.AUTHORIZED_ADMIN,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: CustomerMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.customerService.pagedCustomer(
      take,
      skip,
      name,
      email,
      teamName,
      branchName,
      status,
    );
  }
  @ApiTags('Customer')
  @Get('/:id')
  @ApiOperation({
    summary: 'Api get all customers by id customer, only admin can view',
  })
  async getCustomerById(@Param('id') id: number, @Req() request: Request) {
    await this.abilityService.authenticateToken(request);
    await this.abilityService.authenRoleAdminAndEmployee(request);
    return this.customerService.getCustomerById(id);
  }
  @ApiTags('Customer')
  @Get()
  @ApiOperation({
    summary:
      'Api get all customers with status equal true, only admin can view',
  })
  async getAllCustomer(@Req() request: Request) {
    await this.abilityService.authenticateToken(request);
    await this.abilityService.authenRoleAdminAndEmployee(request);
    return this.customerService.getCustomerAll();
  }

  @ApiTags('Customer')
  @Post()
  @ApiOperation({
    summary: 'Api creates customers and is authorized, only admin can create',
  })
  async create(@Body() body: CreateCustomerDto, @Req() request: Request) {
    // check ability
    await this.abilityService.authenticateToken(request);
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Create, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: CustomerMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.customerService.createCustomer(body);
  }
  @ApiTags('Customer')
  @Put()
  @ApiOperation({
    summary: 'Api updates customers and is authorized, only admin can update',
  })
  async update(@Body() body: UpdateCustomerDto, @Req() request: Request) {
    // check ability
    await this.abilityService.authenticateToken(request);
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Create, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: CustomerMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.customerService.updateCustomer(body);
  }

  @ApiTags('Customer')
  @ApiOperation({
    summary: 'Api block customers and is authorized, only admin can block',
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
          error: CustomerMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.customerService.setStatusCustomer(id, status);
  }
}
