import { CreateBranchDto, PagedBranchDto } from '../dto';
import { BranchEntity } from './../entity/branch.entity';
export class BranchMapper {
  dtoToEntityCreate(dto: CreateBranchDto) {
    const entity = new BranchEntity();
    entity.branchName = dto.branchName;
    entity.status = true;
    return entity;
  }
  async ListEntityToDtoPaged(entity: BranchEntity[]) {
    const list = [];
    for await (const x of entity) {
      const dto = new PagedBranchDto();
      dto.id = x.id;
      dto.branchName = x.branchName;
      dto.status = x.status;
      dto.ableDelete = false;
      if (x.team.length != 0) {
        dto.ableDelete = true;
      }
      list.push(dto);
    }

    return list;
  }
}
