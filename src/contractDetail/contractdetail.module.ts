import { ContractDetailRepository } from './contract-detail.repository';
import { ContractDetailEntity } from './entity/contractDetail.entity';
import { ContractDetailService } from './contractdetail.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ContractDetailController } from './contractdetail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbilityModule } from 'src/ability/ability.module';
import { AbilityService } from 'src/ability/ability.service';
import { JwtModule } from '@nestjs/jwt';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { TypeOrmCustomModule } from 'src/customRepository/typeorm.module';
import { AccountRepository } from 'src/account/account.repository';

@Module({
  imports: [
    TypeOrmCustomModule.forCustomRepository([
      ContractDetailRepository,
      AccountRepository,
    ]),
    TypeOrmModule.forFeature([ContractDetailEntity]),
    TypeOrmModule.forFeature([CustomerEntity]),
    AbilityModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [ContractDetailController],
  providers: [ContractDetailService, AbilityService],
})
export class ContractDetailModule {}
