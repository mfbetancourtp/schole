import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';

export class GetListModulesService {
    async run(params?: ParamsPaginationDto) {
        return axios.
            get<any>(`${services.admin}/configure-menu/modules`,{
                params,
            }
        )
        .then((response) => response.data);
    }
}