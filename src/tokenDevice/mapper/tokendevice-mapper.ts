import { AccountEntity } from 'src/account/entity/account.entity';
import { TokenDeviceEntity } from 'src/tokenDevice/entity/tokendevice.entity';
import { TokenDeviceDto } from './../dto/tokendevice.dto';
export class TokenDeviceMapper {
  fromTokenDeviceEntityToTokenDeviceDto(tokenEntity: TokenDeviceEntity) {
    const tokenDto = new TokenDeviceDto();
    tokenDto.token = tokenEntity.token;
    return tokenDto;
  }

  fromTokenDeviceDtoToTokenDeviceEntity(tokenDto: TokenDeviceDto) {
    const tokenDeviceEntity = new TokenDeviceEntity();
    const account = new AccountEntity();
    account.id = tokenDto.accountid;
    tokenDeviceEntity.token = tokenDto.token;
    tokenDeviceEntity.account = account;
    return tokenDeviceEntity;
  }
}
