import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAcademicPeriodsService {
  run() {
    return axios
      .get<any>(`${services.academic}/academic-planning/academic-periods`)
      .then((response) => response.data);
  }
}
