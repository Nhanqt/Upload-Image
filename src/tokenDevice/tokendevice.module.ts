import { AbilityService } from './../ability/ability.service';
import { TokendeviceService } from './tokendevice.service';
import { TokenDeviceEntity } from './entity/tokendevice.entity';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenDeviceController } from './tokendevice.controller';
import { JwtModule } from '@nestjs/jwt';
import { AbilityModule } from 'src/ability/ability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenDeviceEntity]),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
    AbilityModule,
  ],
  controllers: [TokenDeviceController],
  providers: [TokendeviceService, AbilityService],
})
export class TokendeviceModule {}
