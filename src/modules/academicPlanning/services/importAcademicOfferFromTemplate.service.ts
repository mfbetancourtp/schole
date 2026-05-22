import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import { JsonToFormDataService } from '../../../shared/services/jsonToFormData.service';

const jsonToFormDataService = new JsonToFormDataService();

export class ImportAcademicOfferFromTemplateService {
    async run(data: any, params: any = {}): Promise<void> {
        let newData = jsonToFormDataService.run(data);

        return await axios.post(`${services.academic}/academic-planning/academic-period-groups-import`, newData, {params})
            .then(response => response.data);
    }
}