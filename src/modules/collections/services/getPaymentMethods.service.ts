import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPaymentMethodsService {
    run() {
        return axios.get(`${services.payments}/payment-methods`)
            .then(response => response.data);
    }
}