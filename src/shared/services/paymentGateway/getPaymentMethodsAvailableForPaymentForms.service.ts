import { PaymentMethodsAvailableDto } from '../../dto/paymentGateway/paymentMethodsAvailable.dto';
import { services } from '../../constant/services';
import axios from '../../utils/axios';

export class GetPaymentMethodsAvailableForPaymentFormsService {
  async run(convocationStepId: number): Promise<PaymentMethodsAvailableDto[]> {
    return axios.get<PaymentMethodsAvailableDto[]>(`${services.payments}/payment-methods`, { params: { convocationStepId } }).then((response) => response.data);
  }
}
