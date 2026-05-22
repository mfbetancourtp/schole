import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeletePriceService {
    async run(id: number) {
        await axios.delete(`${services.casurid}/admin-product-values/${id}`);
    }
}