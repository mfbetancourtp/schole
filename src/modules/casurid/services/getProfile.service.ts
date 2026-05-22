import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetProfileService {
    run() {
        return axios.get(`${services.casurid}/access/profile`)
            .then(response => response.data);
    }
}