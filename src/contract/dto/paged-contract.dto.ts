import { PagedServiceDto } from 'src/service/dto';

export class PagedContractDto {
  contractId: number;
  contractCode: string;
  startDate: Date;
  endDate: Date;
  folderContractUrl: string;
  contractDetail: PagedContractDetail[];
  listService: any[];
  key: number;
  createAt: Date;
  status: boolean;
  customerId: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  businessAreas: string;
  teamId: number;
  teamName: string;
  branchName: string;
  accountStatus: boolean;
}
export class PagedContractDetail {
  contractDetailId: number;
  service: PagedServiceDto;
}
