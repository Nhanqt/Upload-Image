import { TeamEntity } from './../../team/entity/team.entity';
import { AccountEntity } from 'src/account/entity/account.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
} from 'typeorm';
@Entity('employee')
export class EmployeeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fullname: string;
  @Column({ unique: true })
  phone: string;
  @Column({ unique: true })
  email: string;
  @Column()
  address: string;
  @Column()
  sex: boolean;
  @Column()
  teamRole: string;
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP()',
  })
  createAt: Date;
  @Column()
  dateOfBirth: Date;
  @OneToOne(() => AccountEntity, (account) => account.id, { cascade: true })
  @JoinColumn()
  account: AccountEntity;
  @ManyToOne(() => TeamEntity, (team) => team.id)
  @JoinColumn()
  public team: TeamEntity;
}
