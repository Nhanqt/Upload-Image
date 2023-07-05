import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { Repository, Raw, In } from 'typeorm';
import { UpdateServiceDto } from './dto';
import { ServiceEntity } from './entity/service.entity';

@CustomRepository(ServiceEntity)
export class ServiceRepository extends Repository<ServiceEntity> {
  public async findAllWithStatusTrue() {
    return await this.find({
      where: { status: true },
    });
  }
  public async paged(
    take: number,
    skip: number,
    serviceName: string,
    status: string,
  ) {
    if (status) {
      const isStatus = status === 'true' ? true : false;
      return await this.findAndCount({
        take,
        skip,
        where: {
          status: isStatus,
          serviceName: serviceName
            ? Raw(
                (alias) =>
                  `LOWER(${alias}) Like '%${serviceName.toLowerCase()}%'`,
              )
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
        where: {
          serviceName: serviceName
            ? Raw(
                (alias) =>
                  `LOWER(${alias}) Like '%${serviceName.toLowerCase()}%'`,
              )
            : Raw((alias) => `${alias} Like '%%'`),
        },
        order: {
          id: 'DESC',
        },
      });
    }
  }
  public async countServiceById(listId: number[]) {
    return await this.count({
      where: { id: In(listId) },
    });
  }
  public async findServiceById(id: number) {
    return await this.findOne({
      where: { id: id },
    });
  }
  public async findServiceByName(name: string) {
    return await this.findOne({
      where: { serviceName: name },
    });
  }
  public async createService(entity: ServiceEntity) {
    return await this.save(entity);
  }
  public async updateService(oldData: ServiceEntity, newData: ServiceEntity) {
    return await this.save({ ...oldData, ...newData });
  }
  public async updateStatus(id: number, status: boolean) {
    return await this.update({ id }, { status });
  }
  public async checkExistServiceByListId(listServiceId: number[]) {
    return await this.count({
      where: {
        id: In(listServiceId),
      },
    });
  }
  public async findService(serviceId: number) {
    return await this.findOne({
      where: {
        id: serviceId,
        status: true,
      },
    });
  }
}
