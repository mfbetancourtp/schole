import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetScholarShipService {
  run() {
    return axios.get(`${services.users}/people/scholarshipList`).then((response) => response.data);
  }
}
