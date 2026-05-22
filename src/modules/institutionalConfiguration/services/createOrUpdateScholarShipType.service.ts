import { services } from '../../../shared/constant/services';
import axios from 'axios';

export class CreateOrUpdateScholarShipTypeService {
  run(data: any) {
    return axios.post(`${services.users}/people/scholarship`, data).then((response) => response.data);
  }
}
