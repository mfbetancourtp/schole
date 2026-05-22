import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { JobVacancyStatDto } from '../dtos/vacancy.dto';

export class GetJobVacanciesStatsService {
  run() {
    return axios.get<JobVacancyStatDto[]>(`${services.graduates}/job-vacancies/stats`).then((r) => r.data);
  }
}
