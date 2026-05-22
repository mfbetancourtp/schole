import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import {ResponsePaginationDto} from '../../../shared/dto/responsePagination.dto';
import {UserDto} from '../../../shared/dto/user.dto';

export class GetUsersWithPaginationService {
    run(params?: ParamsPaginationDto) {
        return axios.get<ResponsePaginationDto<UserDto>>(`${services.users}/access/users`, {
            params,
        }).then(response => response.data);
    }
}