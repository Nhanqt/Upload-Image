import { TeamRepository } from './../team/team.repository';
import { EmployeeRepository } from './../employee/employee.repository';
import { AccountRepository } from 'src/account/account.repository';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerAccountEntity } from '../customerAccount/entity/customerAccount.entity';
import { AbilityService } from './../ability/ability.service';
import { AccountEntity } from './../account/entity/account.entity';
import { TypeOrmCustomModule } from './../customRepository/typeorm.module';
import { EmployeeEntity } from './../employee/entity/employee.entity';
import { RoleEntity } from './../role/entity/role.entity';
import { TeamEntity } from './../team/entity/team.entity';
import { CustomerController } from './customer.controller';
import { CustomerRepository } from './customer.repository';
import { CustomerService } from './customer.service';
import { CustomerEntity } from './entity/customer.entity';
/*
https://docs.nestjs.com/modules
*/

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PagerMiddleware } from 'src/middleware/paper.middleware';
import { CustomerAccountRepository } from 'src/customerAccount/customer-account.repository';
import { RoleRepository } from 'src/role/role.repository';

@Module({
  imports: [
    TypeOrmCustomModule.forCustomRepository([
      CustomerRepository,
      CustomerAccountRepository,
      AccountRepository,
      EmployeeRepository,
      TeamRepository,
      RoleRepository,
    ]),
    TypeOrmModule.forFeature([CustomerEntity]),
    TypeOrmModule.forFeature([CustomerAccountEntity]),
    TypeOrmModule.forFeature([AccountEntity]),
    TypeOrmModule.forFeature([EmployeeEntity]),
    TypeOrmModule.forFeature([TeamEntity]),
    TypeOrmModule.forFeature([RoleEntity]),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, AbilityService],
})
export class CustomerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PagerMiddleware)
      .forRoutes({ path: 'v1/customers/paged', method: RequestMethod.GET });
  }
}
