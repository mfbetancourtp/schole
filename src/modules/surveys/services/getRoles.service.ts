import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetRolesService {
    async run() {
        return axios.get<any>(`${services.users}/access/roles`).then(response => response.data);
    }
}