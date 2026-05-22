import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAcademicPeriodDetailService {
  async run(academicPeriodId: number) {
    return axios.get(`${services.academic}/academic-periods/${academicPeriodId}/detail`).then((response) => response.data);
  }
}
