import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ContractEntity } from './../../contract/entity/contract.entity';
import { ServiceEntity } from './../../service/entity/service.entity';

@Entity('contractDetail')
export class ContractDetailEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => ContractEntity, (contract) => contract.id, { cascade: true })
  @JoinColumn()
  public contract: ContractEntity;
  @ManyToOne(() => ServiceEntity, (service) => service.id, { cascade: true })
  @JoinColumn()
  public service: ServiceEntity;
}
