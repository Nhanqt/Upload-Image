import { TokenDeviceEntity } from 'src/tokenDevice/entity/tokendevice.entity';
import { TokenDeviceDto } from './dto/tokendevice.dto';
/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenDeviceMapper } from './mapper/tokendevice-mapper';
import { map } from 'rxjs';

@Injectable()
export class TokendeviceService {
  constructor(
    @InjectRepository(TokenDeviceEntity)
    private readonly tokenRepository: Repository<TokenDeviceEntity>,
  ) {}

  async getTokenExist(token: string, accountid: number) {
    return await this.tokenRepository.query(`
      select count(id) from "tokenDevice" td 
where token = '${token}' and "accountId" = ${accountid}`);
  }

  async createToken(tokenDto: TokenDeviceDto, accountid: number) {
    tokenDto.accountid = accountid;
    const exist = await this.getTokenExist(tokenDto.token, accountid);

    if (exist[0].count == 0) {
      const mapper = new TokenDeviceMapper();
      const tokenEntity =
        mapper.fromTokenDeviceDtoToTokenDeviceEntity(tokenDto);

      const result = await this.tokenRepository.save(tokenEntity);
      const newData = mapper.fromTokenDeviceEntityToTokenDeviceDto(result);
      return newData;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Token da ton tai',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getListToken(accountid: number) {
    return await this.tokenRepository.query(
      `select td."token" from "tokenDevice" td 
      where "accountId" = ${accountid}`,
    );
  }
}
