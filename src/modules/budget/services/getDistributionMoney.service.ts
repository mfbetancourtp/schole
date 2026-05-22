import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetDistributionMoneyService {
  run() {
    return axios.get(`${services.budget}/admin/distribution-money`).then((response) => response.data);
  }
}
