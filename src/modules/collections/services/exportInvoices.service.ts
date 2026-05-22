import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class ExportInvoicesService {
    async run(data: any): Promise<void> {
        return await axios.post(`${services.casurid}/export-invoices`, data)
            .then(response => response.data);
    }
}