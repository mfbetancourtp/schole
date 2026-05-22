import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class UpdateMatriculateService {
    run(matriculateId: any, data: any) {
        return axios.put(`${services.academic}/academic-administration/matriculates/${matriculateId}/remove`, data)
            .then(response => response.data);
    }
}