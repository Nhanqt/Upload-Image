import { JwtModule } from '@nestjs/jwt';
import { AbilityService } from './ability.service';
import { Global, Module } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';

@Global()
@Module({
  imports: [
    AbilityFactory,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  providers: [AbilityService, AbilityFactory],
  exports: [AbilityFactory],
})
export class AbilityModule {}
