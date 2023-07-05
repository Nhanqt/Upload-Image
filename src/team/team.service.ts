import { HttpException, HttpStatus } from '@nestjs/common';
import { BranchRepository } from './../branch/branch.repository';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamMapper } from './mapper/team-mapper';
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { paginateResponse } from 'src/middleware/paginateResponse';
import { TeamEnum } from './enums/team-enums';
import { TeamRepository } from './team.repository';

@Injectable()
export class TeamService {
  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly teamRepository: TeamRepository,
  ) {}

  async updateTeam(dto: UpdateTeamDto) {
    const mapper = new TeamMapper();
    const entity = await mapper.dtoToEntityUpdate(dto);
    const post = await this.teamRepository.updateTeam(entity);
    return post ? TeamEnum.UPDATE_SUCCESS : TeamEnum.UPDATE_ERROR;
  }
  async getListTeam() {
    const data = await this.teamRepository.findAll();
    const mapper = new TeamMapper();
    return await mapper.listEntityToListDtoGetAll(data);
  }
  async validationCreate(dto: CreateTeamDto) {
    const checkTeam = await this.teamRepository.findTeamByName(dto.teamName);
    if (checkTeam) {
      return TeamEnum.TEAM_NAME_EXIST;
    }
    const checkBranch = await this.branchRepository.checkBranchIsExistById(
      dto.branchId,
    );
    if (!checkBranch) {
      return TeamEnum.BRANCH_NOT_EXIST;
    }
    return null;
  }
  async createTeam(dto: CreateTeamDto) {
    const validation = await this.validationCreate(dto);
    if (validation) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: validation,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const mapper = new TeamMapper();
      const team = await mapper.dtoToEntityCreate(dto);
      return await this.teamRepository.createTeam(team);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: TeamEnum.TEAM_CREATE_ERROR,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async searchTeamByBranchId(id: number) {
    const checkBranch = await this.branchRepository.checkBranchIsExistById(id);
    if (!checkBranch) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: TeamEnum.BRANCH_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const getTeam = await this.teamRepository.findAllTeamByBranchId(
      checkBranch.id,
    );

    if (!getTeam) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: TeamEnum.TEAM_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const mapper = new TeamMapper();
    const res = await mapper.listEntityToDtoShowSearchByBranchId(getTeam);
    return res;
  }
  async pagedTeam(
    take: number,
    skip: number,
    teamName: string,
    branchName: string,
    status: string,
  ) {
    if (isNaN(take)) {
      take = 10;
    }
    if (isNaN(skip)) {
      skip = 1;
    }
    const mapper = new TeamMapper();
    const res = await this.teamRepository.paged(
      take,
      skip,
      teamName,
      branchName,
      status,
    );
    const [data, total] = res;
    const dto = await mapper.ListEntityToDtoPaged(data);
    return paginateResponse(dto, total, skip, take);
  }
}
