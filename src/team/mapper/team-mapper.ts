import { UpdateTeamDto } from './../dto/update-team.dto';
import { BranchEntity } from './../../branch/entity/branch.entity';
import { CreateTeamDto, GetAllTeam, PagedTeamDto, TeamDtoBranch } from '../dto';
import { TeamEntity } from './../entity/team.entity';
export class TeamMapper {
  async ListEntityToDtoPaged(entity: TeamEntity[]) {
    const list = [];
    entity.forEach((x) => {
      const dto = new PagedTeamDto();
      dto.id = x.id;
      dto.teamName = x.teamName;
      dto.status = x.status;
      dto.branchId = x.branch.id;
      dto.branchName = x.branch.branchName;
      list.push(dto);
    });
    return list;
  }
  async listEntityToListDtoGetAll(entity: TeamEntity[]) {
    const list = [];
    entity.forEach((x) => {
      const dto = new GetAllTeam();
      dto.id = x.id;
      dto.teamName = x.teamName;
      dto.status = x.status;
      dto.branchId = x.branch.id;
      dto.branchName = x.branch.branchName;
      dto.isHasLeader = false;

      x.employee.forEach((y) => {
        if (y.teamRole === 'LEADER' && y.account.status === true) {
          dto.isHasLeader = true;
        }
      });

      list.push(dto);
    });
    return list;
  }
  async dtoToEntityCreate(teamDto: CreateTeamDto) {
    const branchEntity = new BranchEntity();
    branchEntity.id = teamDto.branchId;
    const teamEntity = new TeamEntity();
    teamEntity.teamName = teamDto.teamName;
    teamEntity.status = true;
    teamEntity.branch = branchEntity;
    return teamEntity;
  }
  async dtoToEntityUpdate(dto: UpdateTeamDto) {
    const branchEntity = new BranchEntity();
    branchEntity.id = dto.branchId;
    const teamEntity = new TeamEntity();
    teamEntity.teamName = dto.teamName;
    teamEntity.branch = branchEntity;
    return teamEntity;
  }
  async listEntityToDtoShowSearchByBranchId(team: TeamEntity[]) {
    const list = [];
    team.forEach((x) => {
      const dto = new TeamDtoBranch();
      dto.id = x.id;
      dto.teamName = x.teamName;
      dto.isHasLeader = false;
      x.employee.forEach((y) => {
        if (y.teamRole === 'LEADER' && y.account.status === true) {
          dto.isHasLeader = true;
        }
      });
      list.push(dto);
    });
    return list;
  }
}
