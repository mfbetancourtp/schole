import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface CreateTypeContractItemRequest {
  typeContractId: number;
  itemsData: TypeContractItemData[];
}
export interface TypeContractItemData {
  itemId: number;
  orderReport: number;
  isProofOfDischarge: number;
  settlementCertificate: number;
  singleReport: boolean;
}

export class PostTypeContractReportsService {
  run(data: CreateTypeContractItemRequest) {
    return axios.post(`${services.budget}/admin/type-contract-reports`, data).then((response) => response.data);
  }
}
