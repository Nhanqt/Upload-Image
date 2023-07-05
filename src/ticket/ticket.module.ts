import { AbilityService } from 'src/ability/ability.service';
import { TicketEntity } from './entity/ticket.entity';
import { TicketController } from './ticket.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbilityModule } from 'src/ability/ability.module';
import { AccountEntity } from 'src/account/entity/account.entity';
import { TypeOrmCustomModule } from 'src/customRepository/typeorm.module';
import { EmployeeEntity } from 'src/employee/entity/employee.entity';
import { TicketAssignEntity } from 'src/ticketAssign/entity/ticketassign.entity';
import { TicketHistoryEntity } from 'src/ticketHistory/entity/tickethistory.entity';
import { TicketRepository } from './ticket.repository';
import { TicketService } from './ticket.service';
import { AccountService } from 'src/account/account.service';
import { AccountRepository } from 'src/account/account.repository';
import { CustomerAccountEntity } from 'src/customerAccount/entity/customerAccount.entity';
import { AppGateway } from 'src/app.gateway';
import { TeamRepository } from 'src/team/team.repository';
import { CustomerAccountRepository } from 'src/customerAccount/customer-account.repository';
import { TicketAssignRepository } from 'src/ticketAssign/ticketassign.repository';
import { TokenDeviceRepository } from 'src/tokenDevice/tokendevice.repository';
import { ServiceRepository } from 'src/service/service.repository';
import { TicketCategoryEntity } from 'src/ticketCategory/entity/ticketcategory.entity';
import { ContractRepository } from 'src/contract/contract.repository';

@Module({
  imports: [
    TypeOrmCustomModule.forCustomRepository([TicketRepository]),
    TypeOrmCustomModule.forCustomRepository([AccountRepository]),
    TypeOrmCustomModule.forCustomRepository([CustomerAccountRepository]),
    TypeOrmCustomModule.forCustomRepository([TeamRepository]),
    TypeOrmCustomModule.forCustomRepository([TicketAssignRepository]),
    TypeOrmCustomModule.forCustomRepository([TokenDeviceRepository]),
    TypeOrmCustomModule.forCustomRepository([ServiceRepository]),
    TypeOrmCustomModule.forCustomRepository([ContractRepository]),
    TypeOrmModule.forFeature([TicketEntity]),
    TypeOrmModule.forFeature([CustomerAccountEntity]),
    TypeOrmModule.forFeature([AccountEntity]),
    TypeOrmModule.forFeature([TicketHistoryEntity]),
    TypeOrmModule.forFeature([EmployeeEntity]),
    TypeOrmModule.forFeature([TicketAssignEntity]),
    TypeOrmModule.forFeature([TicketCategoryEntity]),
    AbilityModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [TicketController],
  providers: [TicketService, AbilityService, AccountService, AppGateway],
})
export class TicketModule {}
