import axios from '../../../shared/utils/axios';
import {ProductDto} from '../dtos/product.dto';
import {services} from '../../../shared/constant/services';

export class GetPlanByIdService {
    async run(planId: number) {
        return axios.get<ProductDto>(`${services.casurid}/catalogue/admin/products/${planId}`).then(response => response.data);
    }
}