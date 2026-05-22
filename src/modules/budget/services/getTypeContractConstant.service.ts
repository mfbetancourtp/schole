import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetTypeContractConstantService {
  async run() {
    return axios.get(`${services.budget}/admin/type-contract-constant`).then((response) => response.data);
  }
}
