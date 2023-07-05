import { AbilityService } from './../ability/ability.service';
import { TokenDeviceDto } from './dto/tokendevice.dto';
import { TokendeviceService } from './tokendevice.service';
import { Request } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { version } from 'os';

@Controller({ path: 'tokens', version: '1' })
export class TokenDeviceController {
  constructor(
    private readonly tokenDeviceService: TokendeviceService,
    private helperService: AbilityService,
  ) {}

  @ApiTags('TokenDevice')
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.ACCEPTED)
  async createTokenDevice(
    @Body() tokendto: TokenDeviceDto,
    @Req() request: Request,
  ) {
    const data = await this.helperService.authenticateToken(request);
    const accountid = data.user.accountId;

    return this.tokenDeviceService.createToken(tokendto, accountid);
  }
  @ApiTags('TokenDevice')
  @Get()
  @ApiOperation({
    summary: 'api get token by accountid',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.ACCEPTED)
  async getListToken(@Req() request: Request) {
    const data = await this.helperService.authenticateToken(request);
    const accountid = data.user.accountid;
    return this.tokenDeviceService.getListToken(accountid);
  }
}
