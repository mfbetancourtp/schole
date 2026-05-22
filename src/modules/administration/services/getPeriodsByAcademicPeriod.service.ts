import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPeriodsByAcademicPeriodService {
  async run(params: any) {
    return axios.get(`${services.academic}/academic-planning/periods`, { params }).then((response) => response.data);
  }
}
