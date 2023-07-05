import { BranchRepository } from './../branch/branch.repository';
import { TypeOrmCustomModule } from './../customRepository/typeorm.module';
import { EmployeeEntity } from './../employee/entity/employee.entity';
import { TeamEntity } from './entity/team.entity';
import { BranchEntity } from './../branch/entity/branch.entity';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
/*
https://docs.nestjs.com/modules
*/

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AbilityService } from 'src/ability/ability.service';
import { PagerMiddleware } from 'src/middleware/paper.middleware';
import { TeamRepository } from './team.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity, BranchEntity, EmployeeEntity]),
    TypeOrmCustomModule.forCustomRepository([TeamRepository, BranchRepository]),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [TeamController],
  providers: [TeamService, AbilityService],
})
export class TeamModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PagerMiddleware)
      .forRoutes({ path: 'v1/teams/paged', method: RequestMethod.GET });
  }
}
