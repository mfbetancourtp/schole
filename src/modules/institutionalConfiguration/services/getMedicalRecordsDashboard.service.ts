import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetMedicalRecordsDashboardService {
  run(params = {}) {
    return axios.get(`${services.users}/people/medical-records-dashboard`, { params }).then((response) => response.data);
  }
}
