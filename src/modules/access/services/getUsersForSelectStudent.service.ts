import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetUsersForSelectStudentService {
    async run(params: any) {
        return axios.get(`${services.users}/access/students-for-select`, {
            params,
        }).then(response => response.data);
    }
}