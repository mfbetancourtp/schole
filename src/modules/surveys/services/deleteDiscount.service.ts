import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteDiscountService {
    async run(id: number) {
        await axios.delete(`${services.casurid}/admin-discounts/${id}`);
    }
}