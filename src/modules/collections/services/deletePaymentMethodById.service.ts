import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeletePaymentMethodByIdService {
    async run(paymentMethodId: number): Promise<void> {
        await axios.delete(`${services.payments}/payment-methods/${paymentMethodId}`);
    }
}