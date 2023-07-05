import { AccountEntity } from 'src/account/entity/account.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
@Entity('role')
export class RoleEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  roleName: string;
  @OneToMany(() => AccountEntity, (account) => account.role)
  account: AccountEntity[];
}
