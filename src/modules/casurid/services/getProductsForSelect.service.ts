import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';

export class GetProductsForSelectService {
    async run(params: ParamsPaginationDto) {
        return axios.get(`${services.casurid}/catalogue/products-for-select`, {
            params,
        }).then((response) => response.data);
    }
}