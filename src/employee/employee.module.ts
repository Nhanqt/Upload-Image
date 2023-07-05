import { RoleRepository } from './../role/role.repository';
import { TeamRepository } from './../team/team.repository';
import { CustomerRepository } from './../customer/customer.repository';
import { AccountRepository } from 'src/account/account.repository';
import { CustomerEntity } from './../customer/entity/customer.entity';
import { TeamEntity } from './../team/entity/team.entity';
import { RoleEntity } from './../role/entity/role.entity';
import { AccountEntity } from './../account/entity/account.entity';
import { JwtModule } from '@nestjs/jwt';
import { AbilityService } from './../ability/ability.service';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeEntity } from './entity/employee.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
/*
https://docs.nestjs.com/modules
*/

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AbilityModule } from 'src/ability/ability.module';
import { PagerMiddleware } from 'src/middleware/paper.middleware';
import { TypeOrmCustomModule } from 'src/customRepository/typeorm.module';
import { EmployeeRepository } from './employee.repository';

@Module({
  imports: [
    TypeOrmCustomModule.forCustomRepository([
      AccountRepository,
      EmployeeRepository,
      CustomerRepository,
      TeamRepository,
      RoleRepository,
    ]),
    TypeOrmModule.forFeature([
      AccountEntity,
      EmployeeEntity,
      CustomerEntity,
      TeamEntity,
      RoleEntity,
    ]),

    AbilityModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, AbilityService],
})
export class EmployeeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PagerMiddleware)
      .forRoutes(
        { path: 'v1/employees/paged', method: RequestMethod.GET },
        { path: 'v1/employees/paged-by-team-id', method: RequestMethod.GET },
      );
  }
}
