import { services } from '../constant/services';
import axios from '../utils/axios';

interface IParams {
    invoiceId: number;
    value: number;
    paymentMethodId: number;
}

export class PayToInvoiceInCashService {
    async run(data: IParams): Promise<void> {
        return await axios.post(`${services.casurid}/pay-invoice-in-cash`, data)
            .then(response => response.data);
    }
}