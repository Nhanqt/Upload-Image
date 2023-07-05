import { TypeOrmCustomModule } from './../customRepository/typeorm.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from 'src/role/entity/role.entity';

/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { RoleRepository } from './role.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity]),
    TypeOrmCustomModule.forCustomRepository([RoleRepository]),
  ],
  controllers: [],
  providers: [],
})
export class RoleModule {}
