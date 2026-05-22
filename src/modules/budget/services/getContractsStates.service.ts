import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetContractsStatesService {
  run() {
    return axios.get(`${services.budget}/admin/contracts-states`).then((response) => response.data);
  }
}
