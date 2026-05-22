import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetAllPeriodsAdministrationService {
  run() {
    return axios.get(`${services.budget}/admin/periods-budget-validates`).then((response) => response.data);
  }
}
