import { AccountEntity } from 'src/account/entity/account.entity';
import { ContractDetailEntity } from 'src/contractDetail/entity/contractDetail.entity';
import { TicketEntity } from 'src/ticket/entity/ticket.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('service')
export class ServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  serviceName: string;
  @Column({ nullable: true })
  description: string;
  @Column()
  status: boolean;
  @OneToMany(
    () => ContractDetailEntity,
    (contractDetail) => contractDetail.service,
  )
  contractDetail: ContractDetailEntity[];
  @OneToMany(
    () => TicketEntity,
    (ticket) => ticket.service,
  )
  ticket: TicketEntity[];
}
