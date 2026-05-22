import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCompetenciesService {
  run(params?: any) {
    return axios.get(`${services.academic}/competencies`, { params }).then((response) => response.data);
  }
}
