import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { naturePaymentDto } from '../dtos/naturePayment.dto';

export class GetAllNaturePaymentService {
  async run() {
    return axios.get<naturePaymentDto[]>(`${services.budget}/admin/budget-nature-spending`).then((response) => response.data);
  }
}
