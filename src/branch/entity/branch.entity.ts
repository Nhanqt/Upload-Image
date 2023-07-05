import { TeamEntity } from './../../team/entity/team.entity';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  Column,
} from 'typeorm';

@Entity('branch')
export class BranchEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  branchName: string;
  @Column()
  status: boolean;
  @OneToMany(() => TeamEntity, (team) => team.branch, { cascade: true })
  @JoinColumn()
  public team: TeamEntity[];
}
