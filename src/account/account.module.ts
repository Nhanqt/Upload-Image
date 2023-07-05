import { CustomerEntity } from './../customer/entity/customer.entity';
import { CustomerAccountEntity } from '../customerAccount/entity/customerAccount.entity';
import { EmployeeEntity } from './../employee/entity/employee.entity';
import { AbilityService } from './../ability/ability.service';
import { AbilityModule } from './../ability/ability.module';
import { JwtModule } from '@nestjs/jwt';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountService } from './account.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { AccountEntity } from './entity/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity]),
    TypeOrmModule.forFeature([CustomerEntity]),
    TypeOrmModule.forFeature([EmployeeEntity]),
    TypeOrmModule.forFeature([CustomerAccountEntity]),
    AbilityModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [AccountController],
  providers: [AccountService, AbilityService],
  exports: [AccountService, JwtModule],
})
export class AccountModule {}
