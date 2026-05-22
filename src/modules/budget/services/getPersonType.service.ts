import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPersonTypeService {
  run() {
    return axios.get(`${services.budget}/admin/suppliers-type-person`).then((response) => response.data);
  }
}
