import { CustomerRepository } from './../customer/customer.repository';
import { ContractDetailRepository } from './../contractDetail/contract-detail.repository';
import { TypeOrmCustomModule } from 'src/customRepository/typeorm.module';
import { ContractEntity } from './entity/contract.entity';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
/*
https://docs.nestjs.com/modules
*/

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbilityModule } from 'src/ability/ability.module';
import { JwtModule } from '@nestjs/jwt';
import { AbilityService } from 'src/ability/ability.service';
import { ContractDetailEntity } from 'src/contractDetail/entity/contractDetail.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ContractRepository } from './contract.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { ServiceRepository } from 'src/service/service.repository';
import { PagerMiddleware } from 'src/middleware/paper.middleware';
import { AccountRepository } from 'src/account/account.repository';

@Module({
  imports: [
    TypeOrmCustomModule.forCustomRepository([
      ContractRepository,
      ContractDetailRepository,
      ServiceRepository,
      CustomerRepository,
      AccountRepository,
    ]),
    TypeOrmModule.forFeature([ContractEntity]),
    TypeOrmModule.forFeature([ContractDetailEntity]),
    TypeOrmModule.forFeature([ServiceEntity]),
    TypeOrmModule.forFeature([CustomerEntity]),
    AbilityModule,
    ScheduleModule.forRoot(),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [ContractController],
  providers: [ContractService, AbilityService],
})
export class ContractModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PagerMiddleware)
      .forRoutes(
        { path: 'v1/contracts/paged', method: RequestMethod.GET },
        {
          path: 'v1/contracts/paged-by-customer-id',
          method: RequestMethod.GET,
        },
      );
  }
}
