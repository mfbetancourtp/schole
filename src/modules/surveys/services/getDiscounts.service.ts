import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetDiscountsService {
    async run() {
        return axios.get(`${services.casurid}/admin-discounts`)
            .then(response => response.data);
    }
}