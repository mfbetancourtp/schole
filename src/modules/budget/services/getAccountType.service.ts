import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAccountTypeService {
  run() {
    return axios.get(`${services.budget}/admin/type-accounts`).then((response) => response.data);
  }
}
