import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllAcademicPeriodReportService {
  async run(academicPeriod: number) {
    return axios.get<any[]>(`${services.budget}/admin/academic-period-budgets-report?academicPeriodId=${academicPeriod}`).then((response) => response.data);
  }
}
