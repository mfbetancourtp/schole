import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { JobVacancyCatalogItem } from '../dtos/vacancy.dto';

export class GetExperienceLevelsService {
  run() {
    return axios.get<{ data: JobVacancyCatalogItem[] }>(`${services.graduates}/experience-levels`, { params: { perPage: 999 } }).then((r) => r.data);
  }
}
