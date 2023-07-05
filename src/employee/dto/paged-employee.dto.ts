export class PagedEmployeeDto {
  id: number;
  accountid: number;
  username: string;
  fullname: string;
  address: string;
  email: string;
  phone: string;
  teamRole: string;
  sex: boolean;
  teamId: number;
  createAt: Date;
  dateOfBirth: Date;
  teamName: string;
  branchName: string;
  status: boolean;
  isEmailActive: boolean;
  leader: TeamLeader;
}
export class TeamLeader {
  id: number;
  fullname: string;
  address: string;
  email: string;
  phone: string;
  teamRole: string;
  sex: boolean;
  status: boolean;
}
