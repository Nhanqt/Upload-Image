import { ServiceEntity } from './../entity/service.entity';
import { CreateServiceDto, PagedServiceDto, UpdateServiceDto } from '../dto';

export class serviceMapper {
  dtoToEntityCreate(dto: CreateServiceDto) {
    const entity = new ServiceEntity();
    entity.serviceName = dto.serviceName;
    entity.description = dto.description;
    entity.status = true;
    return entity;
  }
  dtoToEntityUpdate(dto: UpdateServiceDto) {
    const entity = new ServiceEntity();
    entity.id = dto.serviceId;
    entity.serviceName = dto.serviceName;
    entity.description = dto.description;
    return entity;
  }
  ListEntityToDtoPaged(entity: ServiceEntity[]) {
    const list = [];
    entity.forEach((x) => {
      const dto = new PagedServiceDto();
      dto.id = x.id;
      dto.serviceName = x.serviceName;
      dto.description = x.description;
      dto.status = true;
      list.push(dto);
    });

    return list;
  }
}
