import { ServiceRepository } from 'src/service/service.repository';
import { ServiceEntity } from './entity/service.entity';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
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
import { AbilityService } from 'src/ability/ability.service';
import { AbilityModule } from 'src/ability/ability.module';
import { JwtModule } from '@nestjs/jwt';
import { PagerMiddleware } from 'src/middleware/paper.middleware';
import { TypeOrmCustomModule } from 'src/customRepository/typeorm.module';

@Module({
  imports: [
    TypeOrmCustomModule.forCustomRepository([ServiceRepository]),
    TypeOrmModule.forFeature([ServiceEntity]),
    AbilityModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [ServiceController],
  providers: [ServiceService, AbilityService],
  exports: [ServiceService, JwtModule],
})
export class ServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PagerMiddleware)
      .forRoutes({ path: 'v1/services/paged', method: RequestMethod.GET });
  }
}
