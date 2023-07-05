import { isBoolean } from 'class-validator';
import { serviceMapper } from './mapper/service.mapper';
/*
https://docs.nestjs.com/providers#services
*/
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { paginateResponse } from 'src/middleware/paginateResponse';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { ServiceEnum } from './enums/service-enums';
import { ServiceRepository } from './service.repository';
@Injectable()
export class ServiceService {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async checkExistServiceName(serviceName: string) {
    const valueFound = this.serviceRepository.findServiceByName(serviceName);
    return valueFound;
  }

  async checkExistServiceId(serviceId: number) {
    const valueFound = this.serviceRepository.findServiceById(serviceId);
    return valueFound;
  }

  async createService(serviceDto: CreateServiceDto) {
    const check = await this.checkExistServiceName(serviceDto.serviceName);
    if (check) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: ServiceEnum.SERVICE_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const mapper = new serviceMapper();
      const entity = mapper.dtoToEntityCreate(serviceDto);
      return this.serviceRepository.createService(entity);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: ServiceEnum.SERVICE_CREATE_ERROR,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateService(serviceDto: UpdateServiceDto) {
    const check = await this.checkExistServiceId(serviceDto.serviceId);
    if (check != null) {
      const mapper = new serviceMapper();
      const entity = mapper.dtoToEntityUpdate(serviceDto);
      return await this.serviceRepository.updateService(check, entity);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: ServiceEnum.SERVICE_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async setStatusCustomer(id: number, status: string | boolean) {
    const check = await this.checkExistServiceId(id);
    if (check != null) {
      if (status === 'true' || status === 'false' || isBoolean(status)) {
        status = status === 'true' ? true : false;
      } else {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: ServiceEnum.STATUS_FORMAT,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.serviceRepository.updateStatus(id, status);
    }
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: ServiceEnum.SERVICE_NOT_EXIST,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  async getAllService() {
    const result = await this.serviceRepository.findAllWithStatusTrue();
    return result;
  }

  async pagedService(
    take: number,
    skip: number,
    serviceName: string,
    status: string,
  ) {
    if (isNaN(take)) {
      take = 10;
    }
    if (isNaN(skip)) {
      skip = 1;
    }

    const mapper = new serviceMapper();
    const res = await this.serviceRepository.paged(
      take,
      skip,
      serviceName,
      status,
    );
    const [data, total] = res;
    const dto = mapper.ListEntityToDtoPaged(data);

    return paginateResponse(dto, total, skip, take);
  }
}
