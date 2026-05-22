import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetTutorStudentsService {
    run() {
        return axios.get(`${services.academic}/academic-administration/matriculate-parents`)
            .then(response => response.data);
    }
}