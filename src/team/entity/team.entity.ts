import { CustomerEntity } from './../../customer/entity/customer.entity';
import { EmployeeEntity } from './../../employee/entity/employee.entity';
import { BranchEntity } from './../../branch/entity/branch.entity';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('team')
export class TeamEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  teamName: string;
  @Column()
  status: boolean;
  @ManyToOne(() => BranchEntity, (branch) => branch.id)
  @JoinColumn()
  public branch: BranchEntity;
  @OneToMany(() => EmployeeEntity, (employee) => employee.team, {
    cascade: true,
  })
  @JoinColumn()
  public employee: EmployeeEntity[];
  @OneToMany(() => CustomerEntity, (customer) => customer.team, {
    cascade: true,
  })
  @JoinColumn()
  public customer: CustomerEntity[];
}
