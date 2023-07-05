/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Action } from 'src/ability/ability.factory';
import { AbilityService } from 'src/ability/ability.service';
import { CreateTicketCategory, UpdateTicketCategory } from './dto';
import { CategoryTicketEnum } from './enums/ticket-category-enums';
import { TicketcategoryService } from './ticketcategory.service';

@Controller({ path: 'ticketCategories', version: '1' })
export class TicketcategoryController {
  constructor(
    private abilityService: AbilityService,
    private ticketCategoryService: TicketcategoryService,
  ) {}

  @ApiTags('Ticket Category')
  @Get('')
  @ApiOperation({
    summary: 'Api get all ticket category',
  })
  async getAllTicketCategory() {
    return this.ticketCategoryService.getAllTicketCategory();
  }
  @ApiTags('Ticket Category')
  @ApiOperation({
    summary: 'Api view category ticket and authorized, only admin can view',
  })
  @ApiQuery({
    name: 'take',
    type: Number,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'skip',
    type: Number,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'categoryName',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'isRelation',
    type: String,
    description: 'A parameter. Optional',
    required: false,
  })
  @Get('paged')
  async paged(
    @Req() request: Request,
    @Query('take')
    take?: number,
    @Query('skip')
    skip?: number,
    @Query('categoryName')
    categoryName?: string,
    @Query('isRelation')
    isRelation?: string,
  ) {
    try {
      await this.abilityService.authenticateToken(request);
      const ability = this.abilityService.authenRoleAdmin(request);
      const isAllow = (await ability).can(Action.Read, 'all');
      if (!isAllow) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: CategoryTicketEnum.AUTHORIZED_ADMIN,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: CategoryTicketEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.ticketCategoryService.paged(
      take,
      skip,
      categoryName,
      isRelation,
    );
  }
  @ApiTags('Ticket Category')
  @Post('')
  @ApiOperation({
    summary: 'Api create ticket category',
  })
  async create(@Req() request: Request, @Body() dto: CreateTicketCategory) {
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Read, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: CategoryTicketEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.ticketCategoryService.createTicketCategory(dto);
  }
  @ApiTags('Ticket Category')
  @Put('')
  @ApiOperation({
    summary: 'Api update ticket category',
  })
  async update(@Req() request: Request, @Body() dto: UpdateTicketCategory) {
    const ability = this.abilityService.authenRoleAdmin(request);
    const isAllow = (await ability).can(Action.Read, 'all');
    if (!isAllow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: CategoryTicketEnum.AUTHORIZED_ADMIN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return this.ticketCategoryService.updateTicketCategory(dto);
  }
}
