import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import {ResponsePaginationDto} from '../../../shared/dto/responsePagination.dto';
import {MunicipalityDto} from '../../../shared/dto/municipality.dto';

interface IParams extends ParamsPaginationDto {
    municipalityId?: number | null;
}

export class GetMunicipalitiesService {
    run(params: IParams) {
        return axios.get<ResponsePaginationDto<MunicipalityDto>>(`${services.casurid}/geography/municipalities-for-select`, {
            params,
        }).then((response) => {
            return response.data;
        });
    }
}