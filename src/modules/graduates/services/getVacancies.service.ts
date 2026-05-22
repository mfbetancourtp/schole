import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetVacanciesService {
  run(filters?: Record<string, string>) {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    return axios.get(`${services.graduates}/vacancies${params ? '?' + params : ''}`).then((r) => r.data);
  }
}
