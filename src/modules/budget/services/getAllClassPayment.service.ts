import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetAllClassPaymentService {
  run(systemId: number) {
    return axios.get(`${services.budget}/admin/budget-payment-class?standardizedAccountingSystemId=${systemId}`).then((response) => response.data);
  }
}
