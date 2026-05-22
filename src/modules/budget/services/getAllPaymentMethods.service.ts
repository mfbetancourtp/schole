import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { paymentMethodsDto } from '../dtos/paymentMethods.dto';

export class GetAllPaymentMethodsService {
  async run() {
    return axios.get<paymentMethodsDto[]>(`${services.budget}/admin/budget-payment-form`).then((response) => response.data);
  }
}
