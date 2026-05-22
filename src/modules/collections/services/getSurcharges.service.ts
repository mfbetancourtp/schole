import {services} from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetSurchargesService {
    run() {
        return axios.get(`${services.collections}/surcharges`)
            .then(response => response.data);
    }
}