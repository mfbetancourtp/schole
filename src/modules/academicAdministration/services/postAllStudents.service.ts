import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class PostAllStudentsService {
    run(data: any) {
        return axios.post(`${services.academic}/academic-administration/matriculates-all/create`, data)
            .then(response => response.data);
    }
}