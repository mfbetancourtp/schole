import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface JobVacancyApplicationStatDto {
  applicationStatus: string;
  total: number;
}

export class GetJobVacanciesApplicationsStatsService {
  run(peopleId: number | string) {
    return axios.get<JobVacancyApplicationStatDto[]>(`${services.graduates}/job-vacancies-applications/stats`, { params: { peopleId } }).then((r) => r.data);
  }
}
