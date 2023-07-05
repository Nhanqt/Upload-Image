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
  Post,
  Put,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Action } from 'src/ability/ability.factory';
import { AbilityService } from 'src/ability/ability.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { ServiceEnum } from './enums/service-enums';
import { ServiceService } from './service.service';
@Controller({ path: 'services', version: '1' })
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private abilityService: AbilityService,
  ) {}
  @ApiTags('Service')
  @ApiOperation({
    summary: 'Api get all services with authen',
  })
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.ACCEPTED)
  async getAll(@Req() request: Request) {
    await this.abilityService.authenticateToken(request);
    return this.serviceService.getAllService();
  }
  @ApiTags('Service')
  @ApiOperation({
    summary: 'Api view service and authorized, only admin can view',
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
    name: 'serviceName',
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
    @Query('serviceName')
    serviceName?: string,
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
            error: ServiceEnum.AUTHORIZED_ADMIN,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: ServiceEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.serviceService.pagedService(
      take,
      skip,
      serviceName,
      status,
    );
  }

  @ApiTags('Service')
  @ApiOperation({
    summary: 'Api creates services and is authorized, only admin can create',
  })
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.ACCEPTED)
  async createService(
    @Body() service: CreateServiceDto,
    @Req() request: Request,
  ) {
    try {
      await this.abilityService.authenticateToken(request);
      const ability = this.abilityService.authenRoleAdmin(request);
      const isAllow = (await ability).can(Action.Create, 'all');
      if (!isAllow) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: ServiceEnum.AUTHORIZED_ADMIN,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: ServiceEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.serviceService.createService(service);
  }

  @ApiTags('Service')
  @ApiOperation({
    summary: 'Api update services and is authorized, only admin can create',
  })
  @Put()
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.ACCEPTED)
  async updateService(
    @Body() service: UpdateServiceDto,
    @Req() request: Request,
  ) {
    try {
      await this.abilityService.authenticateToken(request);
      const ability = this.abilityService.authenRoleAdmin(request);
      const isAllow = (await ability).can(Action.Update, 'all');
      if (!isAllow) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: ServiceEnum.AUTHORIZED_ADMIN,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: ServiceEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return this.serviceService.updateService(service);
  }

  @ApiTags('Service')
  @ApiOperation({
    summary:
      'Api delete service by id service , authorized and authenticate, only admin can use this function',
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
    try {
      await this.abilityService.authenticateToken(request);
      const ability = this.abilityService.authenRoleAdmin(request);
      const isAllow = (await ability).can(Action.Delete, 'all');
      if (!isAllow) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: ServiceEnum.AUTHORIZED_ADMIN,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: ServiceEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return this.serviceService.setStatusCustomer(id, status);
  }
}
