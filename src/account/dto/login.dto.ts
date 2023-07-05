import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}

export class EmployeeLogin {
  accountId: number;
  username: string;
  isFirstLogin: boolean;
  roleName: string;
  status: boolean;
  employeeId: number;
  fullname: string;
  email: string;
  address: string;
  phone: string;
  sex: boolean;
  teamRole: string;
  createAt: Date;
  dateOfBirth: Date;
  teamId: number;
  teamName: string;
  branchId: number;
  branchName: string;
  isEmailActive: boolean;
}
export class CustomerLogin {
  accountId: number;
  username: string;
  isFirstLogin: boolean;
  roleName: string;
  status: boolean;
  customerId: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  businessAreas: string;
  isSignedContract: boolean;
  createAt: Date;
  teamId: number;
  teamName: string;
  branchId: number;
  branchName: string;
  isEmailActive: boolean;
}
export class AdminAndCallCenterLogin {
  accountId: number;
  username: string;
  isFirstLogin: boolean;
  roleName: string;
  status: boolean;
  isEmailActive:boolean;
}
