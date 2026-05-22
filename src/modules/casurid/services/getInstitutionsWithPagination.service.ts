import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IParams extends ParamsPaginationDto {
    cityId: number;
    status: string;
}

export class GetInstitutionsWithPaginationService {
    run(params: IParams) {
        return axios.get(`${services.casurid}/clients/admin/institutions`, {
            params,
        }).then(response => response.data);
    }
}