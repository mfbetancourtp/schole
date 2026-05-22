import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteTypeContractService {
  async run(typeContractId: number) {
    return axios.delete<any>(`${services.budget}/admin/type-contract/${typeContractId}`).then((response) => response.data);
  }
}
