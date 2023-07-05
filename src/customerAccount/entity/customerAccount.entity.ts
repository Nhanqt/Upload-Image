import { CustomerEntity } from '../../customer/entity/customer.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntity } from '../../account/entity/account.entity';

@Entity('customerAccount')
export class CustomerAccountEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => AccountEntity, (account) => account.id, { cascade: true })
  @JoinColumn()
  account: AccountEntity;
  @ManyToOne(() => CustomerEntity, (customer) => customer.id, {
    cascade: true,
  })
  @JoinColumn()
  public customer: CustomerEntity;
}
