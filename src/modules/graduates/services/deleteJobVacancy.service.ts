import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteJobVacancyService {
  run(id: number) {
    return axios.delete(`${services.graduates}/job-vacancies/${id}`).then((r) => r.data);
  }
}
