import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IAddPaymentFromAdminService {
    invoice: {
        id: number;
        totalPaid: number;
        isCredit: boolean;
    };
    quotes: number | null;
    valueQuote: number | null;
    payDay: number | null;
}

export class AddPaymentFromAdminService {
    async run(data: IAddPaymentFromAdminService) {
        await axios.post(`${services.casurid}/payments/admin/invoices`, data);
    }
}