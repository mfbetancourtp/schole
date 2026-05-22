import axios from '../utils/axios';
import { services } from '../constant/services';

export class GetCompanyAreaService {
  run() {
    return axios.get(`${services.users}/people/companyAreasList`).then((response) => response.data);
  }
}
