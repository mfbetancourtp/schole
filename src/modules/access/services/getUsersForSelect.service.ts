import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetUsersForSelectService {
    async run(params: any) {
        return axios.get(`${services.users}/access/users-for-select`, {
            params,
        }).then(response => response.data);
    }
}