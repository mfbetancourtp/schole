import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetInvoiceToEditService {
    async run(invoiceId: number, convocationEnrolStepId: number) {
        return axios.get<any>(`${services.casurid}/admin/invoice-for-discounts/${invoiceId}?convocationEnrolStepId=${convocationEnrolStepId}`)
            .then(response => response.data);
    }
}