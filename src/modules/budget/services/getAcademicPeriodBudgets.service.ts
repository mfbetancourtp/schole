import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAcademicPeriodBudgetsService {
  async run(academicPeriodId: number) {
    return axios.get<any[]>(`${services.budget}/admin/academic-period-budgets?academicPeriodId=${academicPeriodId}`).then((response) => response.data);
  }
}
