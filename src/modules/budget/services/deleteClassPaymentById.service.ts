import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteClassPaymentByIdService {
  async run(classPaymentId: number) {
    await axios.delete(`${services.budget}/admin/budget-payment-class/${classPaymentId}`);
  }
}
