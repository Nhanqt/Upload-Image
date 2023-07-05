/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbilityService } from 'src/ability/ability.service';
import { ContractDetailService } from './contractdetail.service';
import { Request } from 'express';
@Controller({ version: '1', path: 'contractDetails' })
export class ContractDetailController {
  constructor(
    private readonly contractDetailService: ContractDetailService,
    private authenService: AbilityService,
  ) {}

  @ApiTags('Contract Detail')
  @Get('/customers/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary:
      'Api get all contract detail by customer with customer id param and contract is active status',
  })
  async getContractActiveDetailByCustomer(
    @Req() request: Request,
    @Param('id') customerId: number,
  ) {
    const authen = await this.authenService.authenticateToken(request);

    return this.contractDetailService.getAllActiveByCustomer(
      customerId,
      authen.user.accountId,
    );
  }

  //   @ApiTags('Contract Detail')
  //   @Get('/customers/:id')
  //   @UsePipes(new ValidationPipe({ transform: true }))
  //   @HttpCode(HttpStatus.ACCEPTED)
  //   @ApiOperation({
  //     summary: 'Api get all contract detail by customer with customer id param',
  //   })
  //   async getContractDetailByCustomerActive(
  //     @Req() request: Request,
  //     @Param('id') customerId: number,
  //   ) {
  //     await this.authenService.authenticateToken(request);
  //     return this.contractDetailService.getAllByCustomer(customerId);
  //   }
}
