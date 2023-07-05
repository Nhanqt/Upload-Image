import { TicketEntity } from 'src/ticket/entity/ticket.entity';
import { ContractDetailEntity } from './../../contractDetail/entity/contractDetail.entity';
import { CustomerEntity } from './../../customer/entity/customer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('contract')
export class ContractEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  contractCode: string;
  @Column()
  startDate: Date;
  @Column()
  endDate: Date;
  @Column()
  folderContractUrl: string;
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP()',
  })
  createAt: Date;
  @Column()
  status: boolean;
  @ManyToOne(() => CustomerEntity, (customer) => customer.id, { cascade: true })
  @JoinColumn()
  public customer: CustomerEntity;
  @OneToMany(
    () => ContractDetailEntity,
    (contractDetail) => contractDetail.contract,
  )
  contractDetail: ContractDetailEntity[];
}
