import axios from '../utils/axios';
import {services} from '../constant/services';
import {ParamsPaginationDto} from '../dto/paramsPagination.dto';

interface IParams extends ParamsPaginationDto {
    regionId?: number | null;
    municipalityId?: number | null;
}

export class FindAllMunicipalitiesForSelectService {
    run(params: IParams) {
        return axios.get(`${services.users}/geography/municipalities`, {
            params,
        }).then(response => response.data);
    }
}
