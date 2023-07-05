import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';

@Injectable()
export class AbilityService {
  constructor(
    private abilityFactory: AbilityFactory,
    private jwtService: JwtService,
  ) {}
  async authen(request: Request) {
    let cookie = request.cookies['jwt'];
    cookie = cookie == null ? request.headers.authorization : cookie;
    if (cookie == null) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Token không hợp lệ.',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    cookie = cookie.replace('Bearer ', '');

    const data = await this.jwtService.verify(cookie);
    if (data == null) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Phiên đăng nhập hết hạn.',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return data;
  }

  async authenRoleAdmin(request: Request) {
    let cookie = request.cookies['jwt'];
    cookie = cookie == null ? request.headers.authorization : cookie;
    if (cookie == null) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hết phiên đăng nhập.',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    cookie = cookie.replace('Bearer ', '');
    const data = await this.jwtService.verify(cookie);

    const ability = this.abilityFactory.defineAbility(data.user.roleName);
    return ability || undefined;
  }

  async authenRoleEmployee(request: Request) {
    let cookie = request.cookies['jwt'];
    cookie = cookie == null ? request.headers.authorization : cookie;
    if (cookie == null) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hết phiên đăng nhập.',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    cookie = cookie.replace('Bearer ', '');
    const data = await this.jwtService.verify(cookie);
    const ability = this.abilityFactory.defineAbilityEmployee(
      data.user.roleName,
    );
    return ability || undefined;
  }
  async authenIsLeader(data: any) {
    if (data.user.teamRole != 'LEADER') {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Chỉ nhóm trưởng mới có thể sử dụng chức năng này.',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return;
  }
  async defineAbilityCreateTicketAssign(teamRole: string) {
    const ability =
      this.abilityFactory.defineAbilityCreateTicketAssign(teamRole);
    return ability || undefined;
  }

  async defineAbilityUpdateTeamRole(teamRole: string) {
    const ability = this.abilityFactory.defineAbilityUpdateTeamRole(teamRole);
    return ability || undefined;
  }

  async authenticateToken(request: Request) {
    let cookie = request.cookies['jwt'];
    cookie = cookie == null ? request.headers.authorization : cookie;
    if (cookie == null) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Tài khoản chưa đăng nhập.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    cookie = cookie.replace('Bearer ', '');
    const parts = cookie.split('.');

    if (parts.length !== 3) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Tài khoản chưa đăng nhập.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const data = await this.jwtService.verify(cookie);

    data.user['jwt'] = cookie;

    return data;
  }

  async authenRoleAdminAndEmployee(request: Request) {
    let cookie = request.cookies['jwt'];
    cookie = cookie == null ? request.headers.authorization : cookie;
    if (cookie == null) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hết phiên đăng nhập',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    cookie = cookie.replace('Bearer ', '');
    const data = await this.jwtService.verify(cookie);
    const ability = this.abilityFactory.defineAbilityCallcenter(
      data.user.roleName,
    );
    return ability || undefined;
  }
  async authenCallcenter(request: Request) {
    let cookie = request.cookies['jwt'];
    cookie = cookie == null ? request.headers.authorization : cookie;
    if (cookie == null) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Hết phiên đăng nhập',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    cookie = cookie.replace('Bearer ', '');
    const data = await this.jwtService.verify(cookie);
    const ability = this.abilityFactory.defineAbilityCallcenter(
      data.user.roleName,
    );
    return ability || undefined;
  }

  // async authorRoleCustomer(request: Request) {
  //   let cookie = request.cookies['jwt'];
  //   cookie = cookie == null ? request.headers.authorization : cookie;
  //   if (cookie == null) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.FORBIDDEN,
  //         error: 'Hết phiên đăng nhập',
  //       },
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  //   cookie = cookie.replace('Bearer ', '');
  //   const data = await this.jwtService.verify(cookie);
  //   const ability = this.abilityFactory.defineAbilityCustomer(
  //     data.user.roleName,
  //   );
  //   return ability || undefined;
  // }
}
