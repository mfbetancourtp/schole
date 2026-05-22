import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class PayQuotaService {
    async run(data: any): Promise<void> {
        await axios.post(`${services.casurid}/payments/payments-invoice-quotes`, data);
    }
}