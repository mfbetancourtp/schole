import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IPaymentRegisterService {
    invoice: {
        isCredit?: boolean;
        isQuote: boolean;
        totalPaid?: number;
        observations?: string;
    },
    quotes?: number | null;
    valueQuote?: number | null;
    payDay?: number | null;
}


export class PaymentRegisterService {
    async run(data: IPaymentRegisterService) {
        return axios.post(`${services.casurid}/payments/invoices`, data).then(response => response.data);
    }
}
