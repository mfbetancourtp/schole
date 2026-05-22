import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetBudgetPaymentFormConstantService {
  run() {
    return axios.get(`${services.budget}/admin/budget-payment-form-constant`).then((response) => response.data);
  }
}
