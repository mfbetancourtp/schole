import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetJobVacanciesParams, GetJobVacanciesResponseDto } from '../dtos/vacancy.dto';

export class GetJobVacanciesService {
  run(params?: GetJobVacanciesParams) {
    return axios
      .get<GetJobVacanciesResponseDto>(`${services.graduates}/job-vacancies`, {
        params,
      })
      .then((r) => r.data);
  }
}
