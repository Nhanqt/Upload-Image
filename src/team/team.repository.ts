import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { Raw, Repository } from 'typeorm';
import { TeamEntity } from './entity/team.entity';

@CustomRepository(TeamEntity)
export class TeamRepository extends Repository<TeamEntity> {
  public async findTeamById(id: number) {
    return await this.findOne({
      where: { id: id },
    });
  }
  public async findTeamByName(teamName: string) {
    return await this.findOne({
      where: {
        teamName: Raw(
          (alias) => `LOWER(${alias}) = '${teamName.toLowerCase()}'`,
        ),
      },
    });
  }
  public async findAll() {
    return await this.find({
      select: { employee: { teamRole: true, account: { status: true } } },
      relations: { branch: true, employee: { account: true } },
      where: { status: true },
    });
  }

  public async paged(
    take: number,
    skip: number,
    teamName: string,
    branchName: string,
    status: string,
  ) {
    if (status) {
      const isStatus = status === 'true' ? true : false;
      return await this.findAndCount({
        take,
        skip,
        relations: { branch: true },
        where: {
          status: isStatus,
          teamName: teamName
            ? Raw((alias) => `LOWER(${alias}) = '${teamName.toLowerCase()}'`)
            : Raw((alias) => `${alias} Like '%%'`),
          branch: {
            branchName: branchName
              ? Raw(
                  (alias) => `LOWER(${alias}) = '${branchName.toLowerCase()}'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
          },
        },
        order: {
          id: 'DESC',
        },
      });
    } else {
      return await this.findAndCount({
        take,
        skip,
        relations: { branch: true },
        where: {
          teamName: teamName
            ? Raw((alias) => `LOWER(${alias}) = '${teamName.toLowerCase()}'`)
            : Raw((alias) => `${alias} Like '%%'`),
          branch: {
            branchName: branchName
              ? Raw(
                  (alias) => `LOWER(${alias}) = '${branchName.toLowerCase()}'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
          },
        },
        order: {
          id: 'DESC',
        },
      });
    }
  }
  public async findAllTeamByBranchId(id: number) {
    return await this.find({
      select: { employee: { teamRole: true, account: { status: true } } },
      relations: { employee: { account: true } },
      where: { branch: { id: id } },
    });
  }
  public async createTeam(team: TeamEntity) {
    return await this.save(team);
  }
  public async updateTeam(entity: TeamEntity) {
    const oldTeam = await this.findOne({ where: { id: entity.id } });
    return await this.save({ ...oldTeam, ...entity });
  }
}
