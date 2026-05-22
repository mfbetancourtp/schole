import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import {ResponsePaginationDto} from '../../../shared/dto/responsePagination.dto';
import {ShoppingDto} from '../dtos/shopping.dto';

interface Params extends ParamsPaginationDto {
    levelId?: number;
    degreeId?: number;
    subjectId?: number;
}

export class GetShoppingService {
    run(params: Params) {
        return axios.get<ResponsePaginationDto<ShoppingDto>>(`${services.casurid}/purchases/csd-curriculum-products`, {
            params,
        }).then((response) => {
            return response.data;
        });
    }
}