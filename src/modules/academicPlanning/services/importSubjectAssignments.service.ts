import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import { JsonToFormDataService } from '../../../shared/services/jsonToFormData.service';

const jsonToFormDataService = new JsonToFormDataService();

export class ImportSubjectAssignmentsService {
    async run(data: any, params: any = {}): Promise<void> {
        let newData = jsonToFormDataService.run(data);

        return await axios.post(`${services.users}/access/users/import-upload-template`, newData, {params})
            .then(response => response.data);
    }
}