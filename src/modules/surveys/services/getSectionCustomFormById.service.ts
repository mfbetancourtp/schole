import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetSectionCustomFormByIdService {
    async run(sectionId: number) {
        return axios.get(`${services.surveys}/admin/survey-sections/${sectionId}`).then(response => response.data);
    }
}