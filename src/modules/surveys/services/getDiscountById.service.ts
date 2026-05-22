import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetDiscountByIdService {
    async run(id: number) {
        return axios.get(`${services.casurid}/admin-discounts/${id}`)
            .then(response => response.data);
    }
}