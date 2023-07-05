import { TickethistoryService } from './tickethistory.service';
import { TickethistoryController } from './tickethistory.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketHistoryEntity } from './entity/tickethistory.entity';
import { AbilityModule } from 'src/ability/ability.module';
import { JwtModule } from '@nestjs/jwt';
import { AbilityService } from 'src/ability/ability.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketHistoryEntity]),
    AbilityModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [TickethistoryController],
  providers: [TickethistoryService, AbilityService],
})
export class TickethistoryModule {}
