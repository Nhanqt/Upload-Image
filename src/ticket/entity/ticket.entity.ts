import { TicketHistoryEntity } from './../../ticketHistory/entity/tickethistory.entity';
import { ContractEntity } from './../../contract/entity/contract.entity';
import { TicketAssignEntity } from './../../ticketAssign/entity/ticketassign.entity';
import { AccountEntity } from './../../account/entity/account.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { TicketCategoryEntity } from '../../ticketCategory/entity/ticketcategory.entity';

@Entity('ticket')
export class TicketEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  subject: string;
  @Column({ nullable: true })
  description: string;
  @Column()
  priority: string;
  @Column({ nullable: true })
  expectedTimeComplete: Date;
  @Column()
  createAt: Date;
  @Column()
  sendFrom: string;
  @Column()
  status: string;
  @ManyToOne(() => AccountEntity, (account) => account.id, { cascade: true })
  @JoinColumn()
  public account: AccountEntity;
  @OneToMany(() => TicketAssignEntity, (ticketAssign) => ticketAssign.id)
  ticketAssign: TicketAssignEntity[];
  @ManyToOne(() => ServiceEntity, (service) => service.id, { cascade: true })
  @JoinColumn()
  public service: ServiceEntity;
  @ManyToOne(
    () => TicketCategoryEntity,
    (ticketCategory) => ticketCategory.id,
    { cascade: true },
  )
  @JoinColumn()
  public ticketCategory: TicketCategoryEntity;
  @OneToMany(() => TicketHistoryEntity, (ticketHistory) => ticketHistory.id)
  ticketHistory: TicketHistoryEntity[];
}
