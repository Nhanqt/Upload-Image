import { Action } from './../ability/ability.factory';
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
import { CreateTeamDto } from './dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamEnum } from './enums/team-enums';
import { TeamService } from './team.service';

@Controller({ path: 'teams', version: '1' })
export class TeamController {
  constructor(
    private teamService: TeamService,
    private abilityService: AbilityService,
  ) {}
  @ApiTags('Team')
  @Get()
  @ApiOperation({
    summary:
      'Api get list teams with condition status team = true, only admin can use this func',
  })
  async getListTeam(@Req() request: Request) {
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Read, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: TeamEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.teamService.getListTeam();
  }
  @ApiTags('Team')
  @Get('get-all-team-by-branch-id/:id')
  @ApiOperation({
    summary:
      'Api search all team by branch id, only admin can use this function',
  })
  async searchTeamByBranchId(@Req() request: Request, @Param('id') id: number) {
    // check ability
    await this.abilityService.authenticateToken(request);
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Read, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: TeamEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.teamService.searchTeamByBranchId(id);
  }
  @ApiTags('Team')
  @ApiOperation({
    summary: 'Api view team and authorized, only admin can view',
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
            error: TeamEnum.AUTHORIZED_ADMIN,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: TeamEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.teamService.pagedTeam(
      take,
      skip,
      teamName,
      branchName,
      status,
    );
  }
  @ApiTags('Team')
  @Post()
  @ApiOperation({
    summary: 'Api creates teams and is authorized, only admin can create',
  })
  async Create(@Body() body: CreateTeamDto, @Req() request: Request) {
    // check ability
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Create, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: TeamEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.teamService.createTeam(body);
  }

  @ApiTags('Team')
  @Put()
  @ApiOperation({
    summary: 'Api update team with team of id',
  })
  async updateTeam(
    @Body() updateTeamdto: UpdateTeamDto,
    @Req() request: Request,
  ) {
    // check ability
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Create, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: TeamEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.teamService.updateTeam(updateTeamdto);
  }
}
