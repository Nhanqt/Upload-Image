import { Request } from 'express';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbilityService } from './../ability/ability.service';
import { BranchService } from './branch.service';
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
  Get,
  Put,
  Query,
} from '@nestjs/common';
import { Action } from 'src/ability/ability.factory';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import { BranchMessageEnum } from './enums/branch-enums';

@Controller({ path: 'branch', version: '1' })
export class BranchController {
  constructor(
    private branchService: BranchService,
    private abilityService: AbilityService,
  ) {}
  @ApiTags('Branch')
  @ApiOperation({
    summary: 'Api view branch and authorized, only admin can view',
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
            error: BranchMessageEnum.AUTHORIZED_ADMIN,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: BranchMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.branchService.pagedTeam(take, skip, branchName, status);
  }
  @ApiTags('Branch')
  @Post()
  @ApiOperation({
    summary: 'Api creates branches and is authorized, only admin can create',
  })
  async Create(@Body() body: CreateBranchDto, @Req() request: Request) {
    //check ability
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Create, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: BranchMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.branchService.createBranch(body);
  }
  @ApiTags('Branch')
  @Get()
  @ApiOperation({
    summary: 'Api get all branch of company, only admin can use this func',
  })
  async getListBranch(@Req() request: Request) {
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Create, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: BranchMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.branchService.getListBranch();
  }
  @ApiTags('Branch')
  @Put()
  @ApiOperation({
    summary: 'Api update branch of company',
  })
  async updateBranch(
    @Body() updateBranchDto: UpdateBranchDto,
    @Req() request: Request,
  ) {
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Create, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: BranchMessageEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.branchService.updateBranch(updateBranchDto);
  }
}
