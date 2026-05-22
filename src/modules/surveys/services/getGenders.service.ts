import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetGendersService {
    async run() {
        return axios.get<any[]>(`${services.users}/people/genders`)
            .then(response => response.data);
    }
}