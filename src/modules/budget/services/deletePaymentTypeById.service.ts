import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeletePaymentTypeByIdService {
  async run(paymentTypeId: number) {
    await axios.delete(`${services.budget}/admin/budget-payment-type/${paymentTypeId}`);
  }
}
