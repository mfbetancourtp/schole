import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteNaturePaymentByIdService {
  async run(naturePaymentId: number) {
    await axios.delete(`${services.budget}/admin/budget-nature-spending/${naturePaymentId}`);
  }
}
