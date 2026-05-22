import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetInsuranceService {
  run() {
    return axios.get(`${services.users}/people/insuranceList`).then((response) => response.data);
  }
}
