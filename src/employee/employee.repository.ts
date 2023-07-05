import { CustomRepository } from 'src/customRepository/typeorm.decorator';
import { Repository, Not, Raw } from 'typeorm';
import { EmployeeEntity } from './entity/employee.entity';
import { UpdateTeamRoleDto } from './dto/update-teamRole.dto';

@CustomRepository(EmployeeEntity)
export class EmployeeRepository extends Repository<EmployeeEntity> {
  public async findEmployeeByNameOrEmail(param) {
    return await this.query(` 
    select e.id as employeeid, e.fullname ,e.phone ,e.email ,e.address ,e.sex ,e."teamRole" ,e."dateOfBirth",a.status, r."roleName" 
    from employee e 
    join account a on e."accountId" = a.id 
    join "role" r on a."roleId" = r.id
    where e.email like '%${param}%' or e.fullname like '%${param}%'
    `);
  }
  async updateTeamRole(body: UpdateTeamRoleDto) {
    await this.query(`update employee  
    set "teamRole" = '${body.roleName}'
    where  id = ${body.empId}`);

    return { message: `Cập nhật thành công` };
  }

  public async getAllListEmployee() {
    return await this
      .query(`select e.id as employeeid, a.id as accountid ,e.fullname ,e.phone ,e.email ,e.address ,e.sex ,e."teamRole" ,e."dateOfBirth",a.status, r."roleName", t."teamName", t.id as teamid ,b."branchName"
      from employee e 
      join account a on e."accountId" = a.id 
      join "role" r on a."roleId" = r.id
      join team t on t.id = e."teamId"
      join branch b on t."branchId" = b.id
     order by e.id DESC`);
  }
  public async findOneEmployeeByEmail(email: string) {
    return await this.findOne({
      where: { email: email },
    });
  }
  public async findOneEmployeeByPhone(phone: string) {
    return await this.findOne({
      where: { phone: phone },
    });
  }
  public async findOneEmployeeByEmailExceptId(email: string, id: number) {
    return await this.findOne({
      where: { email: email, id: Not(id) },
    });
  }
  public async findOneEmployeeByPhoneExceptId(phone: string, id: number) {
    return await this.findOne({
      where: { phone: phone, id: Not(id) },
    });
  }
  public async createEmployee(entity: EmployeeEntity) {
    return await this.save(entity);
  }
  public async findOneWithStatusTrue(id: number) {
    return await this.findOne({
      relations: { account: true },
      where: { id: id },
    });
  }
  public async updateEmployee(
    dataOld: EmployeeEntity,
    dataNew: EmployeeEntity,
  ) {
    return await this.save({ ...dataOld, ...dataNew });
  }
  public async updateStatusEmployee(data: EmployeeEntity) {
    return await this.save(data);
  }
  public async findAllWithStatusTrue() {
    return await this.find({
      select: {
        account: { status: true },
        team: { id: true },
        id: true,
        email: true,
        fullname: true,
        phone: true,
        sex: true,
        address: true,
        teamRole: true,
      },
      relations: { account: true, team: true },
      where: { account: { status: true }, teamRole: 'LEADER' },
    });
  }
  public async findEmployeeByTeamId(teamId: number) {
    return await this.query(
      `select e.id as employeeid, a.id as accountid ,e.fullname ,e.phone ,e.email ,e.address ,e.sex ,e."teamRole" ,e."dateOfBirth",a.status, r."roleName", t."teamName", b."branchName", t.id as teamid
      from employee e 
      join account a on e."accountId" = a.id 
      join "role" r on a."roleId" = r.id
      join team t on t.id = e."teamId"
      join branch b on t."branchId" = b.id
     where "teamId" = ${teamId} and a.status = true    
     order by e.id DESC`,
    );
  }
  public async paged(
    take: number,
    skip: number,
    name: string,
    email: string,
    teamRole: string,
    teamName: string,
    branchName: string,
    status: string,
    sex: string,
  ) {
    if (status) {
      const isStatus = status === 'true' ? true : false;
      if (sex) {
        const isSex = sex === 'true' ? true : false;
        return await this.findAndCount({
          take,
          skip,
          relations: { account: true, team: { branch: true } },
          where: {
            teamRole: teamRole
              ? Raw((alias) => `LOWER(${alias}) = '${teamRole.toLowerCase()}'`)
              : Raw((alias) => `${alias} Like '%%'`),
            fullname: name
              ? Raw((alias) => `LOWER(${alias}) Like '%${name.toLowerCase()}%'`)
              : Raw((alias) => `${alias} Like '%%'`),
            email: email
              ? Raw(
                  (alias) => `LOWER(${alias}) Like '%${email.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            account: { status: isStatus },
            team: {
              teamName: teamName
                ? Raw(
                    (alias) => `LOWER(${alias}) = '${teamName.toLowerCase()}'`,
                  )
                : Raw((alias) => `${alias} Like '%%'`),
              branch: {
                branchName: branchName
                  ? Raw(
                      (alias) =>
                        `LOWER(${alias}) = '${branchName.toLowerCase()}'`,
                    )
                  : Raw((alias) => `${alias} Like '%%'`),
              },
            },
            sex: isSex,
          },
          order: {
            id: 'DESC',
          },
        });
      } else {
        return await this.findAndCount({
          take,
          skip,
          relations: { account: true, team: { branch: true } },
          where: {
            teamRole: teamRole
              ? Raw((alias) => `LOWER(${alias}) = '${teamRole.toLowerCase()}'`)
              : Raw((alias) => `${alias} Like '%%'`),
            fullname: name
              ? Raw((alias) => `LOWER(${alias}) Like '%${name.toLowerCase()}%'`)
              : Raw((alias) => `${alias} Like '%%'`),
            email: email
              ? Raw(
                  (alias) => `LOWER(${alias}) Like '%${email.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            account: { status: isStatus },
            team: {
              teamName: teamName
                ? Raw(
                    (alias) => `LOWER(${alias}) = '${teamName.toLowerCase()}'`,
                  )
                : Raw((alias) => `${alias} Like '%%'`),
              branch: {
                branchName: branchName
                  ? Raw(
                      (alias) =>
                        `LOWER(${alias}) = '${branchName.toLowerCase()}'`,
                    )
                  : Raw((alias) => `${alias} Like '%%'`),
              },
            },
          },
          order: {
            id: 'DESC',
          },
        });
      }
    } else {
      if (sex) {
        const isSex = sex === 'true' ? true : false;
        return await this.findAndCount({
          take,
          skip,
          relations: { account: true, team: { branch: true } },
          where: {
            teamRole: teamRole
              ? Raw((alias) => `LOWER(${alias}) = '${teamRole.toLowerCase()}'`)
              : Raw((alias) => `${alias} Like '%%'`),
            fullname: name
              ? Raw((alias) => `LOWER(${alias}) Like '%${name.toLowerCase()}%'`)
              : Raw((alias) => `${alias} Like '%%'`),
            email: email
              ? Raw(
                  (alias) => `LOWER(${alias}) Like '%${email.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            team: {
              teamName: teamName
                ? Raw(
                    (alias) => `LOWER(${alias}) = '${teamName.toLowerCase()}'`,
                  )
                : Raw((alias) => `${alias} Like '%%'`),
              branch: {
                branchName: branchName
                  ? Raw(
                      (alias) =>
                        `LOWER(${alias}) = '${branchName.toLowerCase()}'`,
                    )
                  : Raw((alias) => `${alias} Like '%%'`),
              },
            },
            sex: isSex,
          },
          order: {
            id: 'DESC',
          },
        });
      } else {
        return await this.findAndCount({
          take,
          skip,
          relations: { account: true, team: { branch: true } },
          where: {
            teamRole: teamRole
              ? Raw((alias) => `LOWER(${alias}) = '${teamRole.toLowerCase()}'`)
              : Raw((alias) => `${alias} Like '%%'`),
            fullname: name
              ? Raw((alias) => `LOWER(${alias}) Like '%${name.toLowerCase()}%'`)
              : Raw((alias) => `${alias} Like '%%'`),
            email: email
              ? Raw(
                  (alias) => `LOWER(${alias}) Like '%${email.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            team: {
              teamName: teamName
                ? Raw(
                    (alias) => `LOWER(${alias}) = '${teamName.toLowerCase()}'`,
                  )
                : Raw((alias) => `${alias} Like '%%'`),
              branch: {
                branchName: branchName
                  ? Raw(
                      (alias) =>
                        `LOWER(${alias}) = '${branchName.toLowerCase()}'`,
                    )
                  : Raw((alias) => `${alias} Like '%%'`),
              },
            },
          },
          order: {
            id: 'DESC',
          },
        });
      }
    }
  }
  public async pagedByTeam(
    take: number,
    skip: number,
    name: string,
    email: string,
    teamRole: string,
    teamId: number,
    status: string,
    sex: string,
  ) {
    if (status) {
      const isStatus = status === 'true' ? true : false;
      if (sex) {
        const isSex = sex === 'true' ? true : false;
        return await this.findAndCount({
          take,
          skip,
          relations: { account: true, team: { branch: true } },
          where: {
            teamRole: teamRole
              ? Raw((alias) => `LOWER(${alias}) = '${teamRole.toLowerCase()}'`)
              : Raw((alias) => `${alias} Like '%%'`),
            fullname: name
              ? Raw((alias) => `LOWER(${alias}) Like '%${name.toLowerCase()}%'`)
              : Raw((alias) => `${alias} Like '%%'`),
            email: email
              ? Raw(
                  (alias) => `LOWER(${alias}) Like '%${email.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            account: { status: isStatus },
            team: {
              id: teamId,
            },
            sex: isSex,
          },
          order: {
            id: 'DESC',
          },
        });
      } else {
        return await this.findAndCount({
          take,
          skip,
          relations: { account: true, team: { branch: true } },
          where: {
            teamRole: teamRole
              ? Raw((alias) => `LOWER(${alias}) = '${teamRole.toLowerCase()}'`)
              : Raw((alias) => `${alias} Like '%%'`),
            fullname: name
              ? Raw((alias) => `LOWER(${alias}) Like '%${name.toLowerCase()}%'`)
              : Raw((alias) => `${alias} Like '%%'`),
            email: email
              ? Raw(
                  (alias) => `LOWER(${alias}) Like '%${email.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            account: { status: isStatus },
            team: {
              id: teamId,
            },
          },
          order: {
            id: 'DESC',
          },
        });
      }
    } else {
      if (sex) {
        const isSex = sex === 'true' ? true : false;
        return await this.findAndCount({
          take,
          skip,
          relations: { account: true, team: { branch: true } },
          where: {
            teamRole: teamRole
              ? Raw((alias) => `LOWER(${alias}) = '${teamRole.toLowerCase()}'`)
              : Raw((alias) => `${alias} Like '%%'`),
            fullname: name
              ? Raw((alias) => `LOWER(${alias}) Like '%${name.toLowerCase()}%'`)
              : Raw((alias) => `${alias} Like '%%'`),
            email: email
              ? Raw(
                  (alias) => `LOWER(${alias}) Like '%${email.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            team: {
              id: teamId,
            },
            sex: isSex,
          },
          order: {
            id: 'DESC',
          },
        });
      } else {
        return await this.findAndCount({
          take,
          skip,
          relations: { account: true, team: { branch: true } },
          where: {
            teamRole: teamRole
              ? Raw((alias) => `LOWER(${alias}) = '${teamRole.toLowerCase()}'`)
              : Raw((alias) => `${alias} Like '%%'`),
            fullname: name
              ? Raw((alias) => `LOWER(${alias}) Like '%${name.toLowerCase()}%'`)
              : Raw((alias) => `${alias} Like '%%'`),
            email: email
              ? Raw(
                  (alias) => `LOWER(${alias}) Like '%${email.toLowerCase()}%'`,
                )
              : Raw((alias) => `${alias} Like '%%'`),
            team: {
              id: teamId,
            },
          },
          order: {
            id: 'DESC',
          },
        });
      }
    }
  }
}
