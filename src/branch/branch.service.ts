import { paginateResponse } from 'src/middleware/paginateResponse';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BranchRepository } from './branch.repository';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import { BranchMessageEnum } from './enums/branch-enums';
import { BranchMapper } from './mapper/branch.mapper';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepository: BranchRepository) {}
  async getListBranch() {
    return await this.branchRepository.getListBranch();
  }

  async updateBranch(updateBranchDto: UpdateBranchDto) {
    const checkBranch =
      await this.branchRepository.checkBranchIsExistByNameExpectId(
        updateBranchDto.branchName,
        updateBranchDto.id,
      );

    if (checkBranch) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: BranchMessageEnum.BRANCH_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const id = updateBranchDto.id;
    const branchName = updateBranchDto.branchName;
    const status = updateBranchDto.status;
    const post = await this.branchRepository.updateBranch(
      id,
      branchName,
      status,
    );
    return post.affected === 1
      ? BranchMessageEnum.BRANCH_UPDATE_SUCCESS
      : BranchMessageEnum.BRANCH_UPDATE_ERROR;
  }

  async createBranch(dto: CreateBranchDto) {
    const checkBranch = await this.branchRepository.checkBranchIsExistByName(
      dto.branchName,
    );

    if (checkBranch) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: BranchMessageEnum.BRANCH_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const mapper = new BranchMapper();
      const branch = mapper.dtoToEntityCreate(dto);
      return await this.branchRepository.createBranch(branch);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: BranchMessageEnum.BRANCH_CREATE_ERROR,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async pagedTeam(
    take: number,
    skip: number,
    branchName: string,
    status: string,
  ) {
    if (isNaN(take)) {
      take = 10;
    }
    if (isNaN(skip)) {
      skip = 1;
    }
    const mapper = new BranchMapper();
    const res = await this.branchRepository.paged(
      take,
      skip,
      branchName,
      status,
    );
    const [data, total] = res;
    const dto = await mapper.ListEntityToDtoPaged(data);
    return paginateResponse(dto, total, skip, take);
  }
}
