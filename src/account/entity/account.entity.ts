import { RoleEntity } from 'src/role/entity/role.entity';
import { TokenDeviceEntity } from 'src/tokenDevice/entity/tokendevice.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TicketEntity } from './../../ticket/entity/ticket.entity';
import { TicketAssignEntity } from './../../ticketAssign/entity/ticketassign.entity';
import { TicketHistoryEntity } from './../../ticketHistory/entity/tickethistory.entity';
@Entity('account')
export class AccountEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  username: string;
  @Column()
  password: string;
  @Column()
  isFirstLogin: boolean;
  @Column()
  status: boolean;
  @Column()
  isEmailActive: boolean;
  @ManyToOne(() => RoleEntity, (role) => role.id, { cascade: true })
  @JoinColumn()
  public role: RoleEntity;
  @OneToMany(() => TokenDeviceEntity, (tokenDevice) => tokenDevice.id)
  tokenDevice: TokenDeviceEntity[];
  @OneToMany(() => TicketEntity, (ticket) => ticket.account)
  ticket: TicketEntity[];
  @OneToMany(
    () => TicketAssignEntity,
    (ticketAssignor) => ticketAssignor.assignor,
  )
  ticketAssignor: TicketAssignEntity[];
  @OneToMany(
    () => TicketAssignEntity,
    (ticketAssignTo) => ticketAssignTo.assignTo,
  )
  ticketAssignTo: TicketAssignEntity[];
  @OneToMany(
    () => TicketHistoryEntity,
    (ticketHistory) => ticketHistory.account,
  )
  ticketHistory: TicketHistoryEntity[];
}
