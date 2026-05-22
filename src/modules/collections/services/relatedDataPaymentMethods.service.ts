import { PaymentMethodFormDto } from '../dtos/paymentMethodForm.dto';
import {services} from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class RelatedDataPaymentMethodsService {
    run() {
        return axios.get<PaymentMethodFormDto>(`${services.payments}/payment-methods/related-data`)
            .then(response => response.data);
    }
}