import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAcademicPeriodsWithPeriodsForSelectService {
  async run(params: any = {}) {
    return axios.get(`${services.academic}/academic-planning/academic-periods-with-periods-for-select`, { params }).then((response) => response.data);
  }
}
