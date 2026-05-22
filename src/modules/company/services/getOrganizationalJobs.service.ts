import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetOrganizationalJobsService {
  run() {
    return axios.get<any>(`${services.organizational}/admin/organizational-jobs`).then((response) => response.data);
  }
}
