import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetBudgetPlanningService {
  async run(params: any) {
    return axios
      .get(`${services.budget}/admin/budget-planning-periods`, {
        params,
      })
      .then((response) => response.data);
  }
}
