import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class PostTransferStudentService {
    run(data: any) {
        return axios.post(`${services.academic}/academic-administration/transfer-student`, data)
            .then(response => response.data);
    }
}