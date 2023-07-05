/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { paginateResponse } from 'src/middleware/paginateResponse';
import { Not } from 'typeorm';
import { CreateTicketCategory, UpdateTicketCategory } from './dto';
import { CategoryTicketEnum } from './enums/ticket-category-enums';
import { TicketCategoryMapper } from './mapper/ticket-category.mapper';
import { TicketCategoryRepository } from './ticketcategory.repository';

@Injectable()
export class TicketcategoryService {
  constructor(
    private readonly ticketCategoryRepository: TicketCategoryRepository,
  ) {}

  async getAllTicketCategory() {
    return this.ticketCategoryRepository.find();
  }
  async validationCreate(dto: CreateTicketCategory) {
    await this.ticketCategoryRepository
      .findOne({
        where: {
          category: dto.category,
        },
      })
      .then((val) => {
        if (val) {
          throw new HttpException(
            {
              status: HttpStatus.NOT_FOUND,
              error: CategoryTicketEnum.CATEGORY_NAME_EXIST,
            },
            HttpStatus.NOT_FOUND,
          );
        }
      });
  }
  async validationUpdate(dto: UpdateTicketCategory) {
    await this.ticketCategoryRepository
      .findOne({
        where: {
          category: dto.category,
          id: Not(dto.id),
        },
      })
      .then((val) => {
        if (val) {
          throw new HttpException(
            {
              status: HttpStatus.NOT_FOUND,
              error: CategoryTicketEnum.CATEGORY_NAME_EXIST,
            },
            HttpStatus.NOT_FOUND,
          );
        }
      });
  }
  async createTicketCategory(dto: CreateTicketCategory) {
    await this.validationCreate(dto);
    try {
      const mapper = new TicketCategoryMapper();
      const entity = mapper.dtoToEntityTicketCreate(dto);
      this.ticketCategoryRepository.save(entity);
      return CategoryTicketEnum.CREATE_SUCCESS;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: CategoryTicketEnum.CREATE_ERROR,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
  async updateTicketCategory(dto: UpdateTicketCategory) {
    await this.validationUpdate(dto);
    try {
      const mapper = new TicketCategoryMapper();
      const entity = mapper.dtoToEntityTicketUpdate(dto);
      const oldEntity = this.ticketCategoryRepository.findOne({
        where: { id: dto.id },
      });
      this.ticketCategoryRepository.save({ ...oldEntity, ...entity });
      return CategoryTicketEnum.UPDATE_SUCCESS;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: CategoryTicketEnum.UPDATE_ERROR,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
  async paged(
    take: number,
    skip: number,
    categoryName: string,
    isRelation: string,
  ) {
    if (isNaN(take)) {
      take = 10;
    }
    if (isNaN(skip)) {
      skip = 1;
    }
    const mapper = new TicketCategoryMapper();
    const res = await this.ticketCategoryRepository.paged(
      take,
      skip,
      categoryName,
      isRelation,
    );
    const [data, total] = res;
    const dto = await mapper.listEntityToListDtoTicketPaged(data);
    return paginateResponse(dto, total, skip, take);
  }
}
