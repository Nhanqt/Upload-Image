import { ContractEntity } from 'src/contract/entity/contract.entity';
export class GetAllCustomer {
  id: number;
  username: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  businessAreas: string;
  teamId: number;
  accountId: number;
  createAt: Date;
  teamName: string;
  branchName: string;
  status: boolean;
  contract: ContractEntity[];
}
