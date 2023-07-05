import { CustomerAccountRepository } from './customer-account.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmCustomModule } from './../customRepository/typeorm.module';
import { CustomerAccountService } from './customer-account.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { CustomerAccountEntity } from './entity/customerAccount.entity';

@Module({
  imports: [
    TypeOrmCustomModule.forCustomRepository([CustomerAccountRepository]),
    TypeOrmModule.forFeature([CustomerAccountEntity]),
  ],
  controllers: [],
  providers: [CustomerAccountService],
})
export class CustomerAccountModule {}
