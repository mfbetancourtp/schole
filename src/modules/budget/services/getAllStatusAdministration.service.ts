import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetAllStatusAdministrationService {
  run() {
    return axios.get(`${services.budget}/admin/status-budget-validates`).then((response) => response.data);
  }
}
