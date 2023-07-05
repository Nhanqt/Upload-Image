import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { Raw, Repository } from 'typeorm';
import { TicketCategoryEntity } from './entity/ticketcategory.entity';

@CustomRepository(TicketCategoryEntity)
export class TicketCategoryRepository extends Repository<TicketCategoryEntity> {
  public async paged(
    take: number,
    skip: number,
    categoryName: string,
    status: string,
  ) {
    if (status) {
      const isStatus = status === 'true' ? true : false;
      return await this.findAndCount({
        take,
        skip,
        where: {
          isRelativeToContract: isStatus,
          category: categoryName
            ? Raw(
                (alias) =>
                  `LOWER(${alias}) LIKE '%${categoryName.toLowerCase()}%'`,
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
          category: categoryName
            ? Raw(
                (alias) =>
                  `LOWER(${alias}) LIKE '%${categoryName.toLowerCase()}%'`,
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
