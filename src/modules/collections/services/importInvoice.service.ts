import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import { JsonToFormDataService } from '../../../shared/services/jsonToFormData.service';

const jsonToFormDataService = new JsonToFormDataService();

export class ImportInvoiceService {
    async run(data: any): Promise<void> {
        let newData = jsonToFormDataService.run(data);

        return await axios.post(`${services.casurid}/import-invoices`, newData)
            .then(response => response.data);
    }
}