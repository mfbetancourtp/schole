import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetTimetablesUserService {
    run(params: any) {
        return axios.get(`${services.classroom}/classroom-implementation/time-tables-user`, {params})
            .then(response => response.data);
    }
}