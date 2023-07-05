import { TicketEntity } from 'src/ticket/entity/ticket.entity';
import { AccountEntity } from 'src/account/entity/account.entity';
import { TicketAssignEntity } from './../../ticketAssign/entity/ticketassign.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ticketHistory')
export class TicketHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP()',
  })
  createAt: Date;
  @Column()
  status: string;
  @Column({ nullable: true })
  note: string;
  @ManyToOne(() => AccountEntity, (account) => account.id, {
    cascade: true,
  })
  @JoinColumn()
  public account: AccountEntity;
  @ManyToOne(() => TicketEntity, (ticket) => ticket.id, { cascade: true })
  @JoinColumn()
  public ticket: TicketEntity;
}
