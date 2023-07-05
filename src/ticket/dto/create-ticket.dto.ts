import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum PriorityEnums {
  LOW = 'Thấp',
  MEDIUM = 'Trung bình',
  HIGH = 'Cao',
}
export enum SendFromEnums {
  APP = 'App',
  PHONE_CALL = 'Tổng đài',
  SOCIAL = 'Mạng xã hội',
  EMAIL = 'Email',
  OTHER = 'Khác',
}
export enum TicketEnums {
  PENDING = 'Chờ xác nhận',
  APPROVE = 'Đã xác nhận',
  PROCESSING = 'Đang xử lý',
  WAITCOMPLETE = 'Chờ xác nhận hoàn thành',
  COMPLETE = 'Hoàn thành',
  CANCELED = 'Đã hủy',
}

export class CreateTicketDto {
  ticketId: number;
  @ApiProperty()
  accountId: number;
  @ApiProperty()
  subject: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  serviceId: number;
  @ApiProperty()
  @IsEnum(SendFromEnums)
  sendFrom: string;
  @ApiProperty()
  ticketCategoryId: number;
}
