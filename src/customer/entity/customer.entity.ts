import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerAccountEntity } from '../../customerAccount/entity/customerAccount.entity';
import { ContractEntity } from './../../contract/entity/contract.entity';
import { TeamEntity } from './../../team/entity/team.entity';
@Entity('customer')
export class CustomerEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({ unique: true })
  phone: string;
  @Column({ unique: true })
  email: string;
  @Column()
  address: string;
  @Column()
  businessAreas: string;
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP()',
  })
  createAt: Date;
  @Column()
  isSignedContract: boolean;
  @OneToMany(
    () => CustomerAccountEntity,
    (customerAccount) => customerAccount.customer,
  )
  @JoinColumn()
  customerAccount: CustomerAccountEntity[];
  @ManyToOne(() => TeamEntity, (team) => team.id)
  @JoinColumn()
  public team: TeamEntity;
  @OneToMany(() => ContractEntity, (contract) => contract.customer)
  contract: ContractEntity[];
}
