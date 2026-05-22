import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';

export class GetTeachersSelectService {
    run(params: ParamsPaginationDto | any) {
        return axios.get(`${services.users}/access/teachers-for-select`, {params})
            .then(response => response.data);
    }
}