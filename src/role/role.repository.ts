import { UserRole } from 'src/account/enums/account-role-enums';
import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { Repository } from 'typeorm';
import { RoleEntity } from './entity/role.entity';

@CustomRepository(RoleEntity)
export class RoleRepository extends Repository<RoleEntity> {
  public async findIdByEmployeeRole() {
    return await this.findOne({
      where: { roleName: UserRole.EMPLOYEE },
    });
  }
  public async findIdByCustomerRole() {
    return await this.findOne({
      where: { roleName: UserRole.CUSTOMER },
    });
  }
}
