import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IParams extends ParamsPaginationDto {}

export class GetSuppliersService {
    run(params: IParams) {
        return axios.get(`${services.budget}/admin/suppliers-pagination`, {
            params,
        }).then(response => response.data);
    }
}