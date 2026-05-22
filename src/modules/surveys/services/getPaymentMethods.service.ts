import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface PaymentMethodDto {
  id: number;
  title: string;
  paymentType: string;
}

export class GetPaymentMethodsService {
  async run(): Promise<PaymentMethodDto[]> {
    return axios.get<PaymentMethodDto[]>(`${services.payments}/payment-methods`).then((response) => response.data);
  }
}
