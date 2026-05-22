import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { JobVacancyCatalogItem } from '../dtos/vacancy.dto';

export class GetJobVacancyCompaniesService {
  run(params?: { search?: string; perPage?: number }) {
    return axios.get<{ data: JobVacancyCatalogItem[] }>(`${services.graduates}/companies`, { params }).then((r) => r.data);
  }
}
