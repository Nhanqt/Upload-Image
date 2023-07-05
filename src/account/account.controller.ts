import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AbilityService } from 'src/ability/ability.service';
import { AccountService } from './account.service';
import { ChangePasswordDTO, ForgetPassWordDto, LogoutDto } from './dto';
import { AccountDto } from './dto/account.dto';
import { FirstLoginDto } from './dto/first-login.dto';
import { LoginDto } from './dto/login.dto';
import { ResendEmailDto } from './dto/resend-email';
@Controller({ path: 'accounts', version: '1' })
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    private abilityService: AbilityService,
  ) {}
  @ApiTags('Account')
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.ACCEPTED)
  async register(@Body() account: AccountDto) {
    return this.accountService.register(account);
  }

  @ApiTags('Account')
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.ACCEPTED)
  async login(
    @Body() login: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.accountService.login(login, response);
    if (!data.isEmailActive) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Tài khoản chưa được xác minh email',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const jwt = this.jwtService.sign({ user: data });

    response.cookie('jwt', jwt);
    data['jwt'] = jwt;
    return data;
  }

  @ApiTags('Account')
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Body() logoutDto: LogoutDto,
  ) {
    response.clearCookie('jwt');
    const user = await this.abilityService.authenticateToken(request);
    const accountId = user.user.accountId;

    if (logoutDto == null) {
      response.clearCookie('jwt');
    } else {
      await this.accountService.deleteToken(logoutDto, accountId);
    }

    return { message: 'Đăng xuất thành công!' };
  }

  @ApiTags('Account')
  @Get('/getProfile')
  @ApiOperation({
    summary: 'get profile by accountId',
  })
  async getProfileByAccountId(@Req() request: Request) {
    const data = await this.abilityService.authenticateToken(request);

    const accountId = data.user.accountId;

    const user = await this.accountService.findOneByAccountId(accountId);

    const newUser = user[0];

    const newData = await this.accountService.findAccount(
      newUser.accountid,
      newUser.roleName,
    );

    return newData[0];
  }

  @ApiTags('Account')
  @Put('change-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Api change password, got accountid',
  })
  async changePassword(
    @Body() passwordDto: ChangePasswordDTO,
    @Req() request: Request,
  ) {
    try {
      const data = await this.abilityService.authenticateToken(request);

      const id = data.user.accountId;

      return this.accountService.changePassword(passwordDto, id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Vui lòng nhập đúng mật khẩu',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiTags('Account')
  @Put('forget-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async forgetPassword(@Body() forgetPassword: ForgetPassWordDto) {
    return this.accountService.forgetPassword(forgetPassword);
  }

  @ApiTags('Account')
  @Put('change-password-first-login')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async changePasswordIsFirstLogin(
    @Body() isFirstLogin: FirstLoginDto,
    @Req() request: Request,
  ) {
    const data = await this.abilityService.authenticateToken(request);

    const accountId = data.user.accountId;
    return this.accountService.changePasswordIsFirstLogin(
      accountId,
      isFirstLogin,
    );
  }

  @ApiTags('Account')
  @Get('active-account-by-email/:accountid')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async activeAccount(@Param('accountid') accountid: number) {
    return this.accountService.activeAccount(accountid);
  }

  @ApiTags('Account')
  @Put('resend-email')
  async resendEmail(@Body() dto: ResendEmailDto) {
    return this.accountService.resendEmail(dto);
  }
}
