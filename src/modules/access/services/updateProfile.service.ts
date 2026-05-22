import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class UpdateProfileService {
    async run(data: any) {
        return axios.put(`${services.users}/people/general/profiles`, data)
            .then(response => response.data);
    }
}