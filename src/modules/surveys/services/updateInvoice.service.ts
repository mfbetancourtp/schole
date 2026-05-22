import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class UpdateInvoiceService {
    async run(data: any) {
        await axios.post(`${services.casurid}/payments/convocations/update-invoice-with-discounts`, data);
    }
}