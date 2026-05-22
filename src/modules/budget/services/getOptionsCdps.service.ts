import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetOptionsCdpsService {
  run() {
    return axios.get(`${services.budget}/admin/options-cdps`).then((response) => response.data);
  }
}
