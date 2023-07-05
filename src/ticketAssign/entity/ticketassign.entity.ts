import { TicketHistoryEntity } from './../../ticketHistory/entity/tickethistory.entity';
import { AccountEntity } from 'src/account/entity/account.entity';
import { TicketEntity } from 'src/ticket/entity/ticket.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ticketAssign')
export class TicketAssignEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: new Date() })
  assignAt: Date;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  ratingStar: number;
  @Column({ nullable: true })
  ratingAt: Date;
  @Column({ nullable: true })
  ratingDescription: string;
  @Column({ default: false })
  ratingStatus: boolean;
  @ManyToOne(() => TicketEntity, (ticket) => ticket.id, { cascade: true })
  @JoinColumn()
  public ticket: TicketEntity;
  @ManyToOne(() => AccountEntity, (assignor) => assignor.id, { cascade: true })
  @JoinColumn()
  public assignor: AccountEntity;
  @ManyToOne(() => AccountEntity, (assignTo) => assignTo.id, { cascade: true })
  @JoinColumn()
  public assignTo: AccountEntity;
}
