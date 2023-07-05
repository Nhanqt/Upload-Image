import { JwtModule } from '@nestjs/jwt';
import { TypeOrmCustomModule } from 'src/customRepository/typeorm.module';
import { AbilityService } from './../ability/ability.service';
import { PagerMiddleware } from './../middleware/paper.middleware';
import { BranchController } from './branch.controller';
import { BranchRepository } from './branch.repository';
import { BranchService } from './branch.service';
import { BranchEntity } from './entity/branch.entity';
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

@Module({
  imports: [
    TypeOrmCustomModule.forCustomRepository([BranchRepository]),
    TypeOrmModule.forFeature([BranchEntity]),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [BranchController],
  providers: [BranchService, AbilityService],
})
export class BranchModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PagerMiddleware)
      .forRoutes({ path: 'v1/branch/paged', method: RequestMethod.GET });
  }
}
