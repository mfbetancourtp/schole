import axios from '../utils/axios';
import {services} from '../constant/services';
import {ParamsPaginationDto} from '../dto/paramsPagination.dto';

interface IParams extends ParamsPaginationDto {
    countryId?: number | null;
    regionId?: number | null;
}

export class FindAllRegionsForSelectService {
    run(params: IParams) {
        return axios.get(`${services.users}/geography/regions`, {
            params,
        }).then(response => response.data);
    }
}
