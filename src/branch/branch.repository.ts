import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { Repository, Raw, Not } from 'typeorm';
import { BranchEntity } from './entity/branch.entity';

@CustomRepository(BranchEntity)
export class BranchRepository extends Repository<BranchEntity> {
  public async getListBranch() {
    return await this.find({
      order: {
        id: 'DESC',
      },
    });
  }
  public async createBranch(branch: BranchEntity) {
    return await this.save(branch);
  }
  public async updateBranch(id: number, branchName: string, status: boolean) {
    return await this.update({ id }, { branchName, status });
  }
  public async checkBranchIsExistById(branchId: number) {
    return await this.findOne({
      where: { id: branchId },
    });
  }
  public async checkBranchIsExistByName(branchName: string) {
    return await this.findOne({
      where: {
        branchName: Raw(
          (alias) => `LOWER(${alias}) = '${branchName.toLowerCase()}'`,
        ),
      },
    });
  }
  public async checkBranchIsExistByNameExpectId(
    branchName: string,
    id: number,
  ) {
    return await this.findOne({
      where: {
        branchName: Raw(
          (alias) => `LOWER(${alias}) = '${branchName.toLowerCase()}'`,
        ),
        id: Not(id),
      },
    });
  }
  public async paged(
    take: number,
    skip: number,
    branchName: string,
    status: string,
  ) {
    if (status) {
      const isStatus = status === 'true' ? true : false;
      return await this.findAndCount({
        take,
        skip,
        relations: { team: true },
        where: {
          status: isStatus,
          branchName: branchName
            ? Raw((alias) => `LOWER(${alias}) = '${branchName.toLowerCase()}'`)
            : Raw((alias) => `${alias} Like '%%'`),
        },
        order: {
          id: 'DESC',
        },
      });
    } else {
      return await this.findAndCount({
        take,
        skip,
        relations: { team: true },
        where: {
          branchName: branchName
            ? Raw(
                (alias) =>
                  `LOWER(${alias}) LIKE '%${branchName.toLowerCase()}%'`,
              )
            : Raw((alias) => `${alias} Like '%%'`),
        },
        order: {
          id: 'DESC',
        },
      });
    }
  }
}
