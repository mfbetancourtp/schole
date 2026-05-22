import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetStudyPlansService {
    run() {
        return axios.get(`${services.academic}/academic-programs/curriculums`)
            .then((response) => response.data);
    }
}