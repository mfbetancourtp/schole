import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class PostPaymentsConvocationsInvoicesService {
    async run(data: any): Promise<void> {
        return await axios.post(`${services.casurid}/payments/convocations/invoices`, data)
            .then(response => response.data);
    }
}