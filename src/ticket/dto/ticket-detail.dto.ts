import { AccountEntity } from 'src/account/entity/account.entity';
import { EmployeeEntity } from 'src/employee/entity/employee.entity';

export class TicketDetailDto {
  assignor: string;
  asignto: EmployeeEntity[];
  ticketid: number;
  teamid:number;
  subject: string;
  description: string;
  priority: string;
  expectedTimeComplete: Date;
  createAt: Date;
  sendFrom: string;
  serviceName: string;
  status: string;
  name: string;
  teamName: string;
  ticketCategoryid: number;
  category: string;
  isRelativeToContract: boolean;
}
