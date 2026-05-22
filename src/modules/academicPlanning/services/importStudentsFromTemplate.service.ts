import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import { JsonToFormDataService } from '../../../shared/services/jsonToFormData.service';

const jsonToFormDataService = new JsonToFormDataService();

export class ImportStudentsFromTemplateService {
    async run(data: any, params: any = {}): Promise<void> {
        let newData = jsonToFormDataService.run(data);

        return await axios.post(`${services.users}/access/users/import-students-template`, newData, {params})
            .then(response => response.data);
    }
}