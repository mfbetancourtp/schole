import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class WithdrawApplicationService {
  run(id: number) {
    return axios.delete(`${services.graduates}/job-vacancies-applications/${id}`).then((r) => r.data);
  }
}
