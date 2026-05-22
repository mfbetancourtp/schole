import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export interface IGetNotificationsNotOpenService {
    budgetValidateId: any;
  }

export class GetSummaryOfBudgetValidityService {
    async run(params?: IGetNotificationsNotOpenService) {
    return axios.get(`${services.budget}/admin/budget-validates`,{ params }).then((response) => response.data);
  }
}
