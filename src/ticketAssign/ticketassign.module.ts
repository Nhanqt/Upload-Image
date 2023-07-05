import { TicketAssignController } from './ticketassign.controller';
import { TicketassignService } from './ticketassign.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketHistoryEntity } from 'src/ticketHistory/entity/tickethistory.entity';
import { AbilityModule } from 'src/ability/ability.module';
import { AbilityService } from 'src/ability/ability.service';
import { JwtModule } from '@nestjs/jwt';
import { TicketAssignRepository } from './ticketassign.repository';
import { TypeOrmCustomModule } from 'src/customRepository/typeorm.module';
import { TicketRepository } from 'src/ticket/ticket.repository';
import { AccountRepository } from 'src/account/account.repository';
import { TokenDeviceRepository } from 'src/tokenDevice/tokendevice.repository';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports: [
    TypeOrmCustomModule.forCustomRepository([TicketAssignRepository]),
    TypeOrmCustomModule.forCustomRepository([TokenDeviceRepository]),
    TypeOrmCustomModule.forCustomRepository([TicketRepository]),
    TypeOrmCustomModule.forCustomRepository([TicketAssignRepository]),
    TypeOrmModule.forFeature([TicketHistoryEntity]),
    TypeOrmCustomModule.forCustomRepository([AccountRepository]),
    AbilityModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [TicketAssignController],
  providers: [TicketassignService, AbilityService,AppGateway],
})
export class TicketAssignModule {}
