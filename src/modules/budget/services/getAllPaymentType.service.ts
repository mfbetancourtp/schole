import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { paymentTypeDto } from '../dtos/paymentType.dto';

export class GetAllPaymentTypeService {
  async run() {
    return axios.get<paymentTypeDto[]>(`${services.budget}/admin/budget-payment-type`).then((response) => response.data);
  }
}
