import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class PaymentInvoiceConvocationService {
    async run(data: any) {
        const dataSend: any = {
            ...data.extraParams.dataSend,
        };

        dataSend.quotes = data.quotes;
        dataSend.valueQuote = data.valueQuote;
        dataSend.payDay = data.payDay;
        dataSend.totalPaid = data.invoice.totalPaid;
        dataSend.isCredit = data.invoice.isCredit ? 1 : 0;

        return axios.post(`${services.casurid}/payments/convocations/invoices`, dataSend)
            .then(response => response.data);
    }
}