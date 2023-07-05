import { TicketCategoryModule } from './ticketCategory/ticketcategory.module';
import { CustomerAccountModule } from './customerAccount/customer-account.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbilityModule } from './ability/ability.module';
import { AccountModule } from './account/account.module';
import { BranchModule } from './branch/branch.module';
import { ContractModule } from './contract/contract.module';
import { ContractDetailModule } from './contractDetail/contractdetail.module';
import { CustomerModule } from './customer/customer.module';
import { EmployeeModule } from './employee/employee.module';
import { RoleModule } from './role/role.module';
import { ServiceModule } from './service/service.module';
import { TeamModule } from './team/team.module';
import { TicketModule } from './ticket/ticket.module';
import { TicketAssignModule } from './ticketAssign/ticketassign.module';
import { TickethistoryModule } from './ticketHistory/tickethistory.module';
import { TokendeviceModule } from './tokenDevice/tokendevice.module';
@Module({
  imports: [
    TicketCategoryModule,
    CustomerAccountModule,
    TickethistoryModule,
    TicketAssignModule,
    ServiceModule,
    ContractDetailModule,
    ContractModule,
    TicketModule,
    CustomerModule,
    BranchModule,
    TeamModule,
    EmployeeModule,
    RoleModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AccountModule,
    AbilityModule,
    TokendeviceModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(<string>process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})

export class AppModule {}
