import { TicketcategoryController } from './ticketcategory.controller';
import { TicketcategoryService } from './ticketcategory.service';
/*
https://docs.nestjs.com/modules
*/

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AbilityModule } from 'src/ability/ability.module';
import { AbilityService } from 'src/ability/ability.service';
import { TypeOrmCustomModule } from 'src/customRepository/typeorm.module';
import { PagerMiddleware } from 'src/middleware/paper.middleware';
import { TicketCategoryRepository } from './ticketcategory.repository';

@Module({
  imports: [
    TypeOrmCustomModule.forCustomRepository([TicketCategoryRepository]),
    AbilityModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [TicketcategoryController],

  providers: [TicketcategoryService, AbilityService],
})
export class TicketCategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PagerMiddleware).forRoutes({
      path: 'v1/ticketCategories/paged',
      method: RequestMethod.GET,
    });
  }
}
