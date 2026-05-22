

import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateBudgetPlanningPeriodsService {
  async run(id: any, params:any, systemId: any) {
    return axios.put(`${services.budget}/admin/budget-planning-periods-update/${id}?standardizedAccountingSystemId=${systemId}`, params);
  }
}
