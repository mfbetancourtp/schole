import axios from '../utils/axios';
import { services } from '../constant/services';

export class GetPeriodsByAcademicPeriodService {
  async run(params: any) {
    return axios.get(`${services.academic}/academic-planning/periods`, { params }).then((response) => response.data);
  }
}
