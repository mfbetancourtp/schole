import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetBudgetExpenseExecutionService {
  async run(params: any) {
    return axios.get(`${services.budget}/admin/budget-planning-periods-bills`, { params }).then((response) => response.data);
  }
}
