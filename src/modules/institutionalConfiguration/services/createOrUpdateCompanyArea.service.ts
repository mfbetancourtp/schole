import { services } from '../../../shared/constant/services';
import axios from 'axios';

export class CreateOrUpdateCompaniAreaService {
  run(data: any) {
    return axios.post(`${services.users}/people/companyArea`, data).then((response) => response.data);
  }
}
