import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetEmployeeWithOrgaJobsCurrentUserService {
  run() {
    return axios.get<any>(`${services.organizational}/employee-with-organizational-jobs-current-user`).then((response) => response.data);
  }
}
