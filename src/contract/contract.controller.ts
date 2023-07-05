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
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbilityService } from 'src/ability/ability.service';
import { ContractService } from './contract.service';
import { CreateContractRequest } from './dto/contract.dto';
import { Request } from 'express';
import { Action } from 'src/ability/ability.factory';
import { ContractMessageEnum } from './enums/contract.enums';
import { UpdateContractDto } from './dto';

@Controller({ version: '1', path: 'contracts' })
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private authenService: AbilityService,
  ) {}
  @ApiTags('Contract')
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
    name: 'contractCode',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'service',
    type: Number,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
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
    @Query('contractCode')
    contractCode?: string,
    @Query('service')
    service?: number[],
    @Query('startDate')
    startDate?: string | Date,
    @Query('endDate')
    endDate?: string | Date,
    @Query('status')
    status?: string | boolean,
  ) {
    try {
      const ability = this.authenService.authenRoleAdmin(request);
      const isAllow = (await ability).can(Action.Read, 'all');
      if (!isAllow) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: ContractMessageEnum.AUTHORIZED_ADMIN,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: ContractMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.contractService.pagedContract(
      take,
      skip,
      name,
      email,
      contractCode,
      service,
      startDate,
      endDate,
      status,
    );
  }
  @ApiTags('Contract')
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
    name: 'customerId',
    type: Number,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'contractCode',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'service',
    type: Number,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
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
  @Get('paged-by-customer-id')
  async pagedByCustomerId(
    @Req() request: Request,
    @Query('take')
    take?: number,
    @Query('skip')
    skip?: number,
    @Query('customerId')
    customerId?: number,
    @Query('contractCode')
    contractCode?: string,
    @Query('service')
    service?: number[],
    @Query('startDate')
    startDate?: string | Date,
    @Query('endDate')
    endDate?: string | Date,
    @Query('status')
    status?: string | boolean,
  ) {
    try {
      const ability = this.authenService.authenCallcenter(request);
      const isAllow = (await ability).can(Action.Read, 'all');
      if (!isAllow) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: ContractMessageEnum.AUTHORIZED_CALLCENTER,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: ContractMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.contractService.pagedContractByCustomerId(
      take,
      skip,
      customerId,
      contractCode,
      service,
      startDate,
      endDate,
      status,
    );
  }
  @ApiTags('Contract')
  @Get('/customers/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Api get contract by customer id',
  })
  async getContractByCustomerId(
    @Param('id') id: number,
    @Req() request: Request,
  ) {
    const authen = await this.authenService.authenticateToken(request);
    return this.contractService.getContractByCustomer(
      id,
      authen.user.accountId,
    );
  }

  @ApiTags('Contract')
  @Get('')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Api get all contract by Admin',
  })
  async getAllContract(@Req() request: Request) {
    await this.authenService.authenticateToken(request);
    return this.contractService.getAllContract();
  }

  @ApiTags('Contract')
  @Get('/:id')
  @ApiOperation({
    summary: 'Api get contract detail by contract Id',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.ACCEPTED)
  async getContractDetail(@Req() request: Request, @Param('id') id: number) {
    await this.authenService.authenticateToken(request);
    return this.contractService.getContractDetail(id);
  }

  @ApiTags('Contract')
  @Post()
  @ApiOperation({
    summary: 'Api create contract by admin',
  })
  async createService(
    @Body() createContractRequestDto: CreateContractRequest[],
    @Req() request: Request,
  ) {
    await this.authenService.authenticateToken(request);
    return await this.contractService.createContract(createContractRequestDto);
  }
  @ApiTags('Contract')
  @Put()
  @ApiOperation({
    summary: 'Api update contract by admin',
  })
  async updateService(@Body() dto: UpdateContractDto, @Req() request: Request) {
    await this.authenService.authenticateToken(request);
    return await this.contractService.updateContract(dto);
  }
}
