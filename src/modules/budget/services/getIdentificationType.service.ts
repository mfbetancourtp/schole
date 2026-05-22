import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetIdentificactionTypeService {
  run() {
    return axios.get(`${services.users}/people/identification-types`).then((response) => response.data);
  }
}
