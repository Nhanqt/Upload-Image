/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AbilityService } from 'src/ability/ability.service';
import { TickethistoryService } from './tickethistory.service';

@Controller({ path: 'ticketHistories', version: '1' })
export class TickethistoryController {
  constructor(
    private readonly ticketHistoryService: TickethistoryService,
    private readonly ability: AbilityService,
  ) {}

  @ApiTags('Ticket History')
  @Get('/:ticketId')
  @ApiOperation({
    summary: 'Api get ticket history by ticketId',
  })
  async getTicketHistoryByTicketId(
    @Param('ticketId') ticketId: number,
    @Req() request: Request,
  ) {
    await this.ability.authenticateToken(request);
    return this.ticketHistoryService.getByTicketId(ticketId);
  }
}
