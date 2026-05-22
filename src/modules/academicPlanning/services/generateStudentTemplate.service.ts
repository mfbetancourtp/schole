import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GenerateStudentTemplateService {
    run() {
        return axios.get(`${services.users}/template-import-students`)
            .then(response => response.data);
    }
}