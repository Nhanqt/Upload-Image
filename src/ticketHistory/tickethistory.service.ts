/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketHistoryEntity } from './entity/tickethistory.entity';

@Injectable()
export class TickethistoryService {
  constructor(
    @InjectRepository(TicketHistoryEntity)
    private readonly ticketHistoryRepo: Repository<TicketHistoryEntity>,
  ) {}

  async getByTicketId(ticketId: number) {
    const result = await this.ticketHistoryRepo.find({
      where: {
        ticket: {
          id: ticketId,
        },
      },
    });
    return result;
  }
}
