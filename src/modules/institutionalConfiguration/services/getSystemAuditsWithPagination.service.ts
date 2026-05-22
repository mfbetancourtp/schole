import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IParams extends ParamsPaginationDto {
    action: string;
    object:  string;
}
export class GetSystemAuditsWithPaginationservice {
    run(params: IParams) {
        return axios.get(`${services.reports}/system-audits`,{
            params,
        })
.then(response => response.data);
    }
}
