import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetAllBudgetPlanningPeriodsService {
  run(systemId: number) {
    return axios.get(`${services.budget}/admin/budget-planning-periods-name-period?standardizedAccountingSystemId=${systemId}`).then((response) => response.data);
  }
}
