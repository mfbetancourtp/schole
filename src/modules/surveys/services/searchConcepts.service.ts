import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';

export class SearchConceptsService {
    run(params: ParamsPaginationDto) {
        return axios.get(`${services.casurid}/catalogue/products-academics-for-select`, {params})
            .then(response => response.data);
    }
}