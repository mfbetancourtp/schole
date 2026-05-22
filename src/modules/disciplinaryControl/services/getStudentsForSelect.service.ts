import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';

export class GetStudentsForSelectService {
    run(params: ParamsPaginationDto) {
        return axios.get(`${services.users}/access/students-for-select`, {params})
            .then(response => response.data);
    }
}