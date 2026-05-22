import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GenerateTemplateAcademicOfferService {
    run() {
        return axios.get(`${services.academic}/academic-planning/template-import-academic-period-groups`)
            .then(response => response.data);
    }
}