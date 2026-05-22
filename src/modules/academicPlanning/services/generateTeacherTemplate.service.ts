import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GenerateTeacherTemplateService {
    run() {
        return axios.get(`${services.users}/template-import-teachers`)
            .then(response => response.data);
    }
}