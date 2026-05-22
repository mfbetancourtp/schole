import axios from '../utils/axios';
import {services} from '../constant/services';
import {ParamsPaginationDto} from '../dto/paramsPagination.dto';

interface IParams extends ParamsPaginationDto {
    countryId?: number | null;
}

export class FindAllCountriesForSelectService {
    run(params: IParams) {
        return axios.get(`${services.users}/geography/countries`, {params})
            .then(response => response.data);
    }
}
