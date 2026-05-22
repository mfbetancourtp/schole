import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAcademicPeriodsForSelectService {
  async run(params: any) {
    return axios.get(`${services.academic}/academic-planning/academic-periods-for-select`, { params }).then((response) => response.data);
  }
}
