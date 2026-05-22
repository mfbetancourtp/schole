import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';

export class GetItemsParentsService {
    async run() {
        return axios.
            get<any>(`${services.admin}/configure-menu/items-parents`
        )
        .then((response) => response.data);
    }
}