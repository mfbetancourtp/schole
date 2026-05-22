import { services } from '../../../shared/constant/services';
import axios from 'axios';

export class CreateOrUpdateInsuranceService {
  run(data: any) {
    return axios.post(`${services.users}/people/insurance`, data).then((response) => response.data);
  }
}
