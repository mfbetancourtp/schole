import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeletePaymentMethodsByIdService {
  async run(paymentMethodsId: number) {
    await axios.delete(`${services.budget}/admin/budget-payment-form/${paymentMethodsId}`);
  }
}
