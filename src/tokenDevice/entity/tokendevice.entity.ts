import { AccountEntity } from 'src/account/entity/account.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tokenDevice')
export class TokenDeviceEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  token: string;
  @ManyToOne(() => AccountEntity, (account) => account.tokenDevice)
  public account: AccountEntity;
}
