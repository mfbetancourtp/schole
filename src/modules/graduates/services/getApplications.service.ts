import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetApplicationsService {
  run(params?: Record<string, any>) {
    return axios.get(`${services.graduates}/job-vacancies-applications`, { params }).then((r) => r.data);
  }
}
