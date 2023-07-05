import { ApiProperty } from '@nestjs/swagger';
export class AccountDto {
  accountid: number;
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  roleid: number;
  isFirstLogin: boolean;
  status: boolean;
}
