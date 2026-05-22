import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import { JsonToFormDataService } from '../../../shared/services/jsonToFormData.service';

const jsonToFormDataService = new JsonToFormDataService();

export class ImportPaymentsService {
    async run(data: any): Promise<void> {
        let newData = jsonToFormDataService.run(data);

        return await axios.post(`${services.casurid}/import-payments`, newData)
            .then(response => response.data);
    }
}