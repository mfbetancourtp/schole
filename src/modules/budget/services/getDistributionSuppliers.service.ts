import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetDistributionSuppliersService {
  run() {
    return axios.get(`${services.budget}/admin/distribution-suppliers`).then((response) => response.data);
  }
}
