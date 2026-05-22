import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetAllTypeStatusAdministrationService {
  run() {
    return axios.get(`${services.budget}/admin/budget-validates-type`).then((response) => response.data);
  }
}
